document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantsList = details.participants
          .map((participant, index) => `<li>${index + 1}. <a href="mailto:${participant}">${participant}</a></li>`)
          .join("");

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p><strong>Participants:</strong> ${
            details.participants.length > 0
              ? `<button class="toggle-participants">Show Participants</button>
                 <ul class="participants-list hidden">${participantsList}</ul>`
              : "No participants yet"
          }</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add event listener for expand/collapse
        const toggleButton = activityCard.querySelector(".toggle-participants");
        if (toggleButton) {
          const participantsUl = activityCard.querySelector(".participants-list");
          toggleButton.addEventListener("click", () => {
            participantsUl.classList.toggle("hidden");
            toggleButton.textContent = participantsUl.classList.contains("hidden")
              ? "Show Participants"
              : "Hide Participants";
          });
        }

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    document.querySelectorAll("header, section, .activity-card, button, footer").forEach(element => {
      element.classList.toggle("dark-mode");
    });

    const darkModeIcon = document.getElementById("dark-mode-icon");
    darkModeIcon.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
    darkModeToggle.title = document.body.classList.contains("dark-mode") ? "Light Mode" : "Dark Mode";
  });

  // Initialize app
  fetchActivities();
});
