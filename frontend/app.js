const imageInput = document.getElementById("imageInput");
const searchBtn = document.getElementById("searchBtn");
const resultsDiv = document.getElementById("results");
const loader = document.getElementById("loader");
const preview = document.getElementById("preview");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
  }
});

searchBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) {
    alert("Please select an image");
    return;
  }

  resultsDiv.innerHTML = "";
  loader.classList.remove("hidden");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/search-face?top_k=5",
      { method: "POST", body: formData }
    );

    const data = await response.json();
    loader.classList.add("hidden");

    if (!data.matches || data.matches.length === 0) {
      resultsDiv.innerHTML = "<p>No matches found.</p>";
      return;
    }

    data.matches.forEach(match => {
      const score = match.score;
      let label = "LOW";
      let badgeClass = "low";

      if (score >= 0.9) {
        label = "HIGH";
        badgeClass = "high";
      } else if (score >= 0.8) {
        label = "MEDIUM";
        badgeClass = "medium";
      }

      const imgFile = match.image_path.split("/").pop();

      const card = document.createElement("div");
      card.className = "result-card";

      card.innerHTML = `
        <img src="http://127.0.0.1:8000/face-images/${imgFile}" />
        <div class="info">
        <p><strong>Name:</strong> ${match.name ?? "Unknown"}</p>
        <p><strong>Sex:</strong> ${match.sex ?? "N/A"}</p>
        <p><strong>Age:</strong> ${match.age ?? "N/A"}</p>
        <p><strong>Location:</strong> ${match.district}, ${match.state}</p>
        <p><strong>Police Station:</strong> ${match.police_station ?? "N/A"}</p>
        <p><strong>Status:</strong> ${match.tracing_status ?? "Unknown"}</p>
        <p><strong>Similarity:</strong> ${(match.score * 100).toFixed(1)}%</p>

        <span class="badge ${badgeClass}">
        ${label} MATCH
        </span>
        </div>
        `;


      resultsDiv.appendChild(card);
    });

  } catch (err) {
    loader.classList.add("hidden");
    alert("Server error");
    console.error(err);
  }
  const statusClass =
  match.tracing_status === "Traced"
    ? "status-traced"
    : "status-missing";

});
