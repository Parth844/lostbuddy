import numpy as np
import umap
import plotly.graph_objects as go
from scipy.spatial.distance import pdist, squareform
from scipy.sparse.csgraph import minimum_spanning_tree

# ======================
# LOAD DATA
# ======================
embeddings = np.load("embeddings.npy")        # (N, 512)
ids = np.load("ids.npy", allow_pickle=True)   # (N,)

print("✅ Loaded:", embeddings.shape)

# ======================
# 3D UMAP
# ======================
reducer = umap.UMAP(
    n_components=3,
    n_neighbors=15,
    min_dist=0.1,
    metric="cosine",
    random_state=42
)

coords = reducer.fit_transform(embeddings)

# ======================
# MST COMPUTATION
# ======================
print("🔗 Computing distance matrix (this may take ~1 min)...")
dist_matrix = squareform(pdist(coords))
mst = minimum_spanning_tree(dist_matrix)

# Extract edges
edges_x, edges_y, edges_z = [], [], []

coo = mst.tocoo()
for i, j in zip(coo.row, coo.col):
    edges_x += [coords[i, 0], coords[j, 0], None]
    edges_y += [coords[i, 1], coords[j, 1], None]
    edges_z += [coords[i, 2], coords[j, 2], None]

# ======================
# PLOT
# ======================
fig = go.Figure()

# MST lines
fig.add_trace(go.Scatter3d(
    x=edges_x,
    y=edges_y,
    z=edges_z,
    mode="lines",
    line=dict(color="rgba(150,150,150,0.4)", width=1),
    name="MST"
))

# Points
fig.add_trace(go.Scatter3d(
    x=coords[:, 0],
    y=coords[:, 1],
    z=coords[:, 2],
    mode="markers",
    marker=dict(
        size=4,
        color=coords[:, 2],  # depth coloring
        colorscale="Viridis",
        opacity=0.8
    ),
    text=ids,
    hovertemplate="<b>ID:</b> %{text}<br><extra></extra>",
    name="Faces"
))

fig.update_layout(
    title="3D Face Embeddings (UMAP + MST)",
    scene=dict(
        xaxis_title="X",
        yaxis_title="Y",
        zaxis_title="Z"
    ),
    margin=dict(l=0, r=0, b=0, t=40)
)

fig.show()

# Optional save
fig.write_html("face_embeddings_mst_3d.html")