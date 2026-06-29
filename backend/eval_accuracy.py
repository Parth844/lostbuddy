"""Face-recognition accuracy benchmark for the Pehchaan model (buffalo_s).

Measures verification accuracy on a folder-per-identity dataset (e.g. LFW):
genuine pairs (same person, different photos) vs impostor pairs (different
people). Computes accuracy at the production threshold, the best-threshold
accuracy, ROC-AUC, and TAR@FAR operating points.

Run inside the backend container (it already has insightface + the model):
    docker compose cp backend/eval_accuracy.py backend:/app/eval_accuracy.py
    docker compose cp <lfw_dir> backend:/data
    docker compose exec backend python /app/eval_accuracy.py /data \
        --max-identities 300 --threshold 0.60
"""
import os
import sys
import argparse
import random
import numpy as np
from PIL import Image
from face import app as face_app  # reuse the configured FaceAnalysis (FACE_MODEL)


def list_identities(root):
    """Return {identity: [image_paths]} for identities with >= 2 images."""
    ids = {}
    for name in sorted(os.listdir(root)):
        d = os.path.join(root, name)
        if not os.path.isdir(d):
            continue
        imgs = [os.path.join(d, f) for f in os.listdir(d)
                if f.lower().endswith((".jpg", ".jpeg", ".png"))]
        if len(imgs) >= 2:
            ids[name] = sorted(imgs)
    return ids


def embed(path):
    try:
        img = np.array(Image.open(path).convert("RGB"))
    except Exception:
        return None
    faces = face_app.get(img)
    if not faces:
        return None
    f = max(faces, key=lambda x: (x.bbox[2]-x.bbox[0])*(x.bbox[3]-x.bbox[1]))
    v = f.embedding
    n = np.linalg.norm(v)
    return v / n if n else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root", help="dataset root (folder per identity)")
    ap.add_argument("--max-identities", type=int, default=300)
    ap.add_argument("--max-imgs-per-id", type=int, default=4)
    ap.add_argument("--threshold", type=float, default=0.60)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()
    random.seed(args.seed)

    ids = list_identities(args.root)
    print(f"Found {len(ids)} identities with >=2 images")
    chosen = dict(list(ids.items())[:args.max_identities])

    # Embed (cap images per identity for speed)
    emb = {}
    for name, imgs in chosen.items():
        vecs = []
        for p in imgs[:args.max_imgs_per_id]:
            v = embed(p)
            if v is not None:
                vecs.append(v)
        if len(vecs) >= 2:
            emb[name] = vecs
    print(f"Embedded {len(emb)} usable identities")

    names = list(emb.keys())

    # Genuine pairs: all within-identity combinations
    genuine = []
    for vecs in emb.values():
        for i in range(len(vecs)):
            for j in range(i+1, len(vecs)):
                genuine.append(float(np.dot(vecs[i], vecs[j])))

    # Impostor pairs: first image of random different identities
    impostor = []
    target = len(genuine)
    while len(impostor) < target and len(names) > 1:
        a, b = random.sample(names, 2)
        impostor.append(float(np.dot(emb[a][0], emb[b][0])))

    g = np.array(genuine); im = np.array(impostor)
    print(f"\nGenuine pairs: {len(g)}  |  Impostor pairs: {len(im)}")
    print(f"Genuine  score  mean={g.mean():.3f} std={g.std():.3f} min={g.min():.3f}")
    print(f"Impostor score  mean={im.mean():.3f} std={im.std():.3f} max={im.max():.3f}")

    def metrics_at(t):
        tar = (g >= t).mean()          # true accept rate (recall on genuine)
        far = (im >= t).mean()         # false accept rate (false match)
        acc = ((g >= t).sum() + (im < t).sum()) / (len(g) + len(im))
        return tar, far, acc

    t = args.threshold
    tar, far, acc = metrics_at(t)
    print(f"\n=== At production threshold {t:.2f} ===")
    print(f"Accuracy            : {acc*100:.2f}%")
    print(f"True Accept Rate    : {tar*100:.2f}%  (genuine pairs correctly matched)")
    print(f"False Accept Rate   : {far*100:.2f}%  (impostors wrongly matched)")

    # Best-threshold accuracy sweep
    thr = np.linspace(0.2, 0.9, 71)
    accs = [metrics_at(x)[2] for x in thr]
    bi = int(np.argmax(accs))
    print(f"\n=== Best threshold ===")
    print(f"Threshold {thr[bi]:.3f} -> Accuracy {accs[bi]*100:.2f}%")

    # ROC-AUC
    labels = np.concatenate([np.ones_like(g), np.zeros_like(im)])
    scores = np.concatenate([g, im])
    order = np.argsort(-scores)
    labels = labels[order]
    P = labels.sum(); N = len(labels) - P
    tp = np.cumsum(labels); fp = np.cumsum(1 - labels)
    tpr = tp / P; fpr = fp / N
    auc = np.trapz(tpr, fpr)
    print(f"\nROC-AUC: {auc:.4f}")

    # TAR @ fixed FAR operating points
    for far_target in (0.01, 0.001):
        mask = fpr <= far_target
        tar_at = tpr[mask].max() if mask.any() else 0.0
        print(f"TAR @ FAR={far_target:g}: {tar_at*100:.2f}%")


if __name__ == "__main__":
    main()
