const BASE_URL = "http://127.0.0.1:8000";

/**
 * Uploads a photo to the backend and returns the result.
 * @param {File} file
 * @returns {Promise<Object>}
 */
export const uploadPhoto = async (file) => {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/upload-photo`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Photo upload failed");
  }

  return res.json();
};

/**
 * Sends an image to the face matching endpoint and returns the search result.
 * @param {File} file
 * @returns {Promise<Object>}
 */
export const matchFace = async (file) => {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/search`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Face matching failed");
  }

  return res.json();
};

/**
 * Fetches all persons stored in the backend.
 * @returns {Promise<Array>}
 */
export const getPersons = async () => {
  const res = await fetch(`${BASE_URL}/persons`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch persons");
  }

  return res.json();
};
