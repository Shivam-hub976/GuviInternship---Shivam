$(document).ready(function() {
    // Clear message alerts on focus
    $("#email, #password, #confirmPassword").focus(function() {
        $("#errorMessage").hide();
        $("#successMessage").hide();
        $("#infoMessage").hide();
    });

    $("#registerBtn").click(function() {
        // Get form values
        var email = $("#email").val().trim();
        var password = $("#password").val();
        var confirmPassword = $("#confirmPassword").val();

        // Reset messages
        $("#errorMessage").hide();
        $("#successMessage").hide();

        // Validation
        if (!email || !password || !confirmPassword) {
            showErrorMessage("Please fill all fields");
            return false;
        }

        // Email validation
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showErrorMessage("Please enter a valid email address");
            return false;
        }

        // Password validation
        if (password.length < 6) {
            showErrorMessage("Password must be at least 6 characters long");
            return false;
        }

        // Password match validation
        if (password !== confirmPassword) {
            showErrorMessage("Passwords do not match");
            return false;
        }

        // Disable button to prevent multiple submissions
        $(this).prop('disabled', true);
        var originalText = $(this).html();
        $(this).html('<span class="spinner-border spinner-border-sm mr-2"></span>Registering...');

        // AJAX request to register.php
        $.ajax({
            url: "php/register.php",
            type: "POST",
            data: {
                email: email,
                password: password
            },
            dataType: "json",
            success: function(response) {
                if (response.status == "success") {
                    showSuccessMessage("Registration Successful! Redirecting to login...");
                    setTimeout(function() {
                        window.location.href = "login.html";
                    }, 2000);
                } else {
                    showErrorMessage(response.message || "Registration failed");
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
        $("#registerBtn").prop('disabled', false).html(originalText);
    }

    // Allow Enter key to submit
    $(document).keypress(function(event) {
        if (event.which == 13) {
            $("#registerBtn").click();
            return false;
        }
    });
});