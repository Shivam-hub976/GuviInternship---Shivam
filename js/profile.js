$(document).ready(function() {
    // 1. Check if token exists in LocalStorage
    var token = localStorage.getItem("session_token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // 2. Load existing profile data on page load
    loadProfileData();

    // 3. Update profile data when Update button is clicked
    $("#updateBtn").click(function() {
        updateProfile();
    });

    // 4. Logout functionality (both buttons)
    $("#logoutBtn, #logoutBtnSecondary").click(function() {
        logout();
    });

    // 5. Clear message alerts on input focus
    $("#age, #dob, #contact").focus(function() {
        $("#errorMessage").hide();
        $("#successMessage").hide();
        $("#infoMessage").hide();
    });

    // Helper function to load profile data from server
    function loadProfileData() {
        $.ajax({
            url: "php/profile.php",
            type: "POST",
            data: {
                action: "fetch",
                token: token
            },
            dataType: "json",
            success: function(response) {
                if (response.status == "success") {
                    // Populate form with fetched data
                    $("#age").val(response.data.age || "");
                    $("#dob").val(response.data.dob || "");
                    $("#contact").val(response.data.contact || "");
                    showInfoMessage("Profile loaded successfully");
                } else {
                    if (response.message.includes("Session Expired") || response.message.includes("Invalid")) {
                        showErrorMessage("Session expired. Please login again.");
                        setTimeout(function() {
                            window.location.href = "login.html";
                        }, 2000);
                    } else {
                        showErrorMessage(response.message || "Failed to load profile");
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", error);
                showErrorMessage("Network error while loading profile. Please refresh the page.");
            }
        });
    }

    // Helper function to update profile data
    function updateProfile() {
        var age = $("#age").val().trim();
        var dob = $("#dob").val();
        var contact = $("#contact").val().trim();

        // Reset messages
        $("#errorMessage").hide();
        $("#successMessage").hide();

        // Validation
        if (age && (isNaN(age) || age < 1 || age > 150)) {
            showErrorMessage("Please enter a valid age");
            return false;
        }

        if (contact && contact.length < 10) {
            showErrorMessage("Please enter a valid contact number");
            return false;
        }

        // Disable button to prevent multiple submissions
        $(this).prop('disabled', true);
        var originalText = $("#updateBtn").html();
        $("#updateBtn").html('<span class="spinner-border spinner-border-sm mr-2"></span>Updating...');

        // AJAX request to update profile
        $.ajax({
            url: "php/profile.php",
            type: "POST",
            data: {
                action: "update",
                token: token,
                age: age,
                dob: dob,
                contact: contact
            },
            dataType: "json",
            success: function(response) {
                if (response.status == "success") {
                    showSuccessMessage("Profile updated successfully!");
                } else {
                    if (response.message.includes("Session Expired") || response.message.includes("Invalid")) {
                        showErrorMessage("Session expired. Please login again.");
                        setTimeout(function() {
                            window.location.href = "login.html";
                        }, 2000);
                    } else {
                        showErrorMessage(response.message || "Failed to update profile");
                    }
                }
                resetUpdateButton(originalText);
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", error);
                showErrorMessage("Network error. Please try again.");
                resetUpdateButton(originalText);
            }
        });
    }

    // Helper function to logout
    function logout() {
        // Remove token from localStorage
        localStorage.removeItem("session_token");
        
        // Show logout message
        showInfoMessage("You have been logged out. Redirecting...");
        
        // Redirect to login page
        setTimeout(function() {
            window.location.href = "login.html";
        }, 1500);
    }

    // Helper function to show error message
    function showErrorMessage(message) {
        $("#errorMessage").html(message).show();
        $("#successMessage").hide();
        $("#infoMessage").hide();
    }

    // Helper function to show success message
    function showSuccessMessage(message) {
        $("#successMessage").html(message).show();
        $("#errorMessage").hide();
        $("#infoMessage").hide();
    }

    // Helper function to show info message
    function showInfoMessage(message) {
        $("#infoMessage").html(message).show();
        $("#errorMessage").hide();
        $("#successMessage").hide();
    }

    // Helper function to reset update button
    function resetUpdateButton(originalText) {
        $("#updateBtn").prop('disabled', false).html(originalText);
    }
});