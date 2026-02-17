$(document).ready(function() {
    // Clear message alerts on focus
    $("#loginEmail, #loginPassword").focus(function() {
        $("#errorMessage").hide();
        $("#successMessage").hide();
    });

    $("#loginBtn").click(function() {
        // Get form values
        var email = $("#loginEmail").val().trim();
        var password = $("#loginPassword").val();

        // Reset messages
        $("#errorMessage").hide();
        $("#successMessage").hide();

        // Validation
        if (!email || !password) {
            showErrorMessage("Please fill all fields");
            return false;
        }

        // Email validation
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showErrorMessage("Please enter a valid email address");
            return false;
        }

        // Disable button to prevent multiple submissions
        $(this).prop('disabled', true);
        var originalText = $(this).html();
        $(this).html('<span class="spinner-border spinner-border-sm mr-2"></span>Logging in...');

        // AJAX request to login.php
        $.ajax({
            url: "php/login.php",
            type: "POST",
            data: {
                email: email,
                password: password
            },
            dataType: "json",
            success: function(response) {
                if (response.status == "success") {
                    // Store session token in LocalStorage as per requirements
                    localStorage.setItem("session_token", response.token);
                    showSuccessMessage("Login Successful! Redirecting to profile...");
                    setTimeout(function() {
                        window.location.href = "profile.html";
                    }, 1500);
                } else {
                    showErrorMessage("Login Failed: " + (response.message || "Unknown error"));
                    resetButton(originalText);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", error);
                showErrorMessage("Network error. Please try again.");
                resetButton(originalText);
            }
        });
    });

    // Helper function to show error message
    function showErrorMessage(message) {
        $("#errorMessage").html(message).show();
    }

    // Helper function to show success message
    function showSuccessMessage(message) {
        $("#successMessage").html(message).show();
    }

    // Helper function to reset button
    function resetButton(originalText) {
        $("#loginBtn").prop('disabled', false).html(originalText);
    }

    // Allow Enter key to submit
    $(document).keypress(function(event) {
        if (event.which == 13) {
            $("#loginBtn").click();
            return false;
        }
    });
});