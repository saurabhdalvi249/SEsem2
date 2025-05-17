document.addEventListener("DOMContentLoaded", function() {
    const memberForm = document.getElementById("member-form");
    const membersListDiv = document.getElementById("members-list");

    // Store members in an array
    let members = [];

    // Function to display members
    function displayMembers() {
        membersListDiv.innerHTML = "";  // Clear the list before re-rendering
        members.forEach((member, index) => {
            const memberDiv = document.createElement("div");
            memberDiv.classList.add("member-card");

            const memberInfoDiv = document.createElement("div");
            memberInfoDiv.classList.add("member-info");

            memberInfoDiv.innerHTML = `
                <strong>${member.name}</strong>
                Age: ${member.age}
                Membership: ${member.membership}
            `;

            // Add delete button for each member
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("delete-btn");
            deleteButton.addEventListener("click", () => {
                members.splice(index, 1);  // Remove the member from the array
                displayMembers();  // Re-render the list
            });

            memberDiv.appendChild(memberInfoDiv);
            memberDiv.appendChild(deleteButton);
            membersListDiv.appendChild(memberDiv);
        });
    }

    // Handle form submission
    memberForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const age = document.getElementById("age").value;
        const membership = document.getElementById("membership").value;

        // Add new member to the array
        members.push({ name, age, membership });

        // Reset form fields
        memberForm.reset();

        // Re-render the member list
        displayMembers();
    });

    // Initially display any existing members (empty on load)
    displayMembers();
});
