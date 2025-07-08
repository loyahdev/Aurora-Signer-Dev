function addNoCacheToFetch() {
    const originalFetch = window.fetch;
    window.fetch = function() {
        if (arguments[0] instanceof Request) {
            arguments[0] = new Request(arguments[0], {
                cache: 'no-store',
                headers: {
                    ...arguments[0].headers,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
        } else {
            if (typeof arguments[1] !== 'object') {
                arguments[1] = {};
            }
            if (!arguments[1].headers) {
                arguments[1].headers = {};
            }
            arguments[1].cache = 'no-store';
            arguments[1].headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
            arguments[1].headers['Pragma'] = 'no-cache';
            arguments[1].headers['Expires'] = '0';
        }
        return originalFetch.apply(this, arguments);
    };
}

addNoCacheToFetch();

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("ASrequest");
    const resultDiv = document.getElementById("result");
    const loader = document.getElementById("loader");
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const signInButton = document.getElementById("signInButton");
    const authPopup = document.getElementById("authPopup");
    const authForm = document.getElementById("authForm");
    const authTitle = document.getElementById("authTitle");
    const authSubmit = document.getElementById("authSubmit");
    const authToggle = document.getElementById("authToggle");
    const userInfo = document.getElementById("userInfo");
    const usernameDisplay = document.getElementById("username-display");
    const privacyPolicyAgreement = document.getElementById("privacyPolicyAgreement");
    const agreePrivacyPolicyCheckbox = document.getElementById("agreePrivacyPolicy");
    const viewPrivacyPolicyLink = document.getElementById("viewPrivacyPolicy");
    const maxFileSizeElement = document.getElementById('maxFileSize');
    const linkDurationInfo = document.getElementById('linkDuration');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const dropdownMenu = document.getElementById('dropdownMenu');

    let isLoginMode = false;
    let currentUser = null;

    togglePassword.addEventListener("click", function () {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
    });

    if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!currentUser) {
            showNotification("Please log in to sign IPAs", "error");
            return;
        }

        // Logging user and file info
        console.log("Signing request initiated by user:", currentUser.username);
        const ipaFile = document.getElementById('ipa').files[0];
        console.log("File selected for signing:", ipaFile ? ipaFile.name : "No file selected");

        const maxSize = currentUser.premium ? 1.5 * 1024 * 1024 * 1024 : 1024 * 1024 * 1024;

        if (ipaFile && ipaFile.size > maxSize) {
            showNotification(`File size exceeds the ${currentUser.premium ? '1.5 GB' : '1 GB'} limit. ${currentUser.premium ? '' : 'Upgrade to premium for larger files.'}`, "error");
            return;
        }

        resultDiv.textContent = "";
        loader.classList.remove("hidden");

        const formData = new FormData(form);
        formData.append("isPremium", currentUser.premium ? 'true' : 'false');
        formData.append("expiryDays", currentUser.premium ? "120" : "30");
        formData.append("username", currentUser.username);

        const button = form.querySelector('button[type="submit"]');
if (button) {
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;
} else {
    console.warn("Submit button not found in the form.");
}

        try {
            console.log("Sending signing request to API...");
            console.log("User premium status:", currentUser.premium);
            
            const response = await fetch("https://api.cherrysideloading.xyz/sign", {
                method: "POST",
                body: formData
            });

            console.log("Response received from API with status:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Signing successful. API response:", result);
            handleSigningSuccess(result);
        } catch (error) {
            console.error("Error during signing request:", error);
            handleSigningError(error);
        } finally {
            button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign IPA';
            button.disabled = false;
        }
    });
}

function handleSigningSuccess(data) {
    loader.classList.add("hidden");
    console.log("Handling signing success. Data:", data);
    
    if (data.install_url) {
        const installLink = document.createElement("a");
        
        if (data.install_url.includes('loot-link.com')) {
            console.log("Processing LootLabs URL:", data.install_url);
            installLink.href = data.install_url;
        } else {
            console.log("Processing direct install URL:", data.install_url);
            installLink.href = data.install_url;
        }
        
        installLink.textContent = "Install App";
        installLink.className = "install-link";
        resultDiv.appendChild(installLink);
        showNotification("IPA signed successfully!", "success");
    } else {
        console.error("Failed to obtain install link from response data.");
        throw new Error("Unable to get the install link");
    }
}

    async function handleSigningError(error) {
        console.error("Signing process failed:", error);
        loader.classList.add("hidden");

        if (error.response) {
            if (error.response.status === 400) {
                error.response.json().then((data) => {
                    const errorMessage = data.error || "An error occurred. Please try again.";
                    resultDiv.textContent = `Error: ${errorMessage}`;
                    showNotification(errorMessage, "error");
                }).catch(() => {
                    resultDiv.textContent = "Error: Failed to sign. Please contact support.";
                    showNotification("Failed to sign. Please contact support.", "error");
                });
            } else {
                resultDiv.textContent = `Error: ${error.response.statusText || "An error occurred"}`;
                showNotification(`Error: ${error.response.statusText || "An error occurred"}`, "error");
            }
        } else {
            resultDiv.textContent = "An error occured while signing, P12 password may be incorrect.";
            showNotification("An error occured while signing, P12 password may be incorrect.", "error");
        }
    }

function handleRegistrationError(error) {
    console.error("Registration process failed:", error);

    loader.classList.add("hidden");

    // If error.response exists and it's a validation error (status 400)
    if (error.response && error.response.status === 400) {
        error.response.json().then((data) => {
            const errorMessage = data.error || "An error occurred. Please try again.";
            resultDiv.textContent = `Error: ${errorMessage}`;
            showNotification(errorMessage, "error");
        }).catch(() => {
            // In case parsing the error message fails
            resultDiv.textContent = "Error: Failed to register. Please contact support.";
            showNotification("Failed to register. Please contact support.", "error");
        });
    } else {
        // For any other kind of error (e.g., network error or unexpected server error)
        resultDiv.textContent = "Error: Internal server error. Please try again later.";
        showNotification("Internal server error", "error");
    }
}

    function showNotification(message, type) {
        const notification = document.createElement("div");
        notification.textContent = message;
        notification.className = `notification ${type}`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    const fileInputs = document.querySelectorAll('input[type="file"]');
    if (fileInputs.length > 0) {
        fileInputs.forEach((input) => {
            input.addEventListener("change", function (event) {
                const file = event.target.files[0];
                if (file && !isValidFileType(file, input.id)) {
                    showNotification(
                        `Invalid file type for ${input.id}. Please select the correct file.`,
                        "error"
                    );
                    input.value = "";
                }
            });
        });
    }

    function isValidFileType(file, inputId) {
        const validTypes = {
            p12: [".p12"],
            mobileprovision: [".mobileprovision"],
            ipa: [".ipa"],
        };
        const fileExtension = file.name.split(".").pop().toLowerCase();
        return validTypes[inputId].includes(`.${fileExtension}`);
    }

    if (signInButton) {
        signInButton.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentUser) {
                // Show sign-out confirmation
                if (confirm("Are you sure you want to sign out?")) {
                    currentUser = null;
                    localStorage.removeItem('currentUser');
                    checkLoginStatus();
                    showNotification("Signed out successfully", "success");
                }
            } else {
                if (authPopup) {
                    authPopup.classList.remove('hidden');
                } else {
                    console.error("Auth popup not found");
                }
            }
        });
    }

    if (authToggle) {
        authToggle.addEventListener("click", (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            authTitle.textContent = isLoginMode ? "Login" : "Sign Up";
            authSubmit.textContent = isLoginMode ? "Login" : "Sign Up";
            authToggle.innerHTML = isLoginMode ? 'Don\'t have an account? <a href="#">Sign Up</a>' : 'Already have an account? <a href="#">Login</a>';
            privacyPolicyAgreement.style.display = isLoginMode ? "none" : "block";
            agreePrivacyPolicyCheckbox.required = !isLoginMode;
        });
    }

    if (authForm) {
        authForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("auth-username").value;
            const password = document.getElementById("auth-password").value;

            if (!isLoginMode && !agreePrivacyPolicyCheckbox.checked) {
                showNotification("You must agree to the Privacy Policy to sign up.", "error");
                return;
            }

            if (isLoginMode) {
                const user = await db.loginUser(username, password);
                if (user) {
                    currentUser = {
                        username: user.username,
                        premium: user.premium, 
                        isDev: user.isDev
                    };
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    showNotification("Logged in successfully!", "success");
                    authPopup.classList.add('hidden');
                    checkLoginStatus();
                } else {
                    showNotification("Invalid username or password", "error");
                }
            } else {
                const success = await registerUser(username, password);
                if (success) {
                    showNotification("Account created successfully! You can now log in.", "success");
                    // The UI is already updated in the registerUser function
                }
            }
        });
    }

        async function registerUser(username, password) {
        try {
            console.log('Attempting register with:', username, password);
            const response = await fetch('https://admin.cherrysideloading.xyz/api.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', username, password }),
            });
            const data = await response.json();
console.log(data);
if (data.success) {
    showNotification('Registration successful. You can now log in.', 'success');
    // Instead of calling toggleAuthMode, we'll update the UI directly
    isLoginMode = true;
    authTitle.textContent = "Login";
    authSubmit.textContent = "Login";
    authToggle.innerHTML = 'Don\'t have an account? <a href="#">Sign Up</a>';
    privacyPolicyAgreement.style.display = "none";
    agreePrivacyPolicyCheckbox.required = false;
    return true;
} else {
    console.error('Registration failed:', data); // Logs the full error details
    showNotification(data.error || 'Registration failed. Please try again.', 'error');
    return false;
}Ï
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('An error occurred during registration. Please try again.', 'error');
            return false;
        }
    }

    function checkLoginStatus() {
        const storedUser = localStorage.getItem('currentUser');
        currentUser = storedUser ? JSON.parse(storedUser) : null;
        if (currentUser) {
            if (signInButton) signInButton.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
            if (userInfo) userInfo.classList.remove("hidden");
            if (usernameDisplay) {
                usernameDisplay.textContent = currentUser.username;
                if (currentUser.premium) {
                    usernameDisplay.innerHTML += ' <span class="premium-badge">Premium</span>';
                    linkDurationInfo.textContent = 'Links last for 4 months because you have premium';
                } else {
                    linkDurationInfo.textContent = 'Links last for 1 month';
                }
                if (currentUser.isDev) {
                    usernameDisplay.innerHTML += ' <span class="dev-badge">Dev</span>';
                }
            }
            const devButton = document.getElementById('devButton');
            if (currentUser.isDev && devButton) {
                devButton.classList.remove("hidden");
                devButton.addEventListener('click', toggleAdminPanel);
            } else if (devButton) {
                devButton.classList.add("hidden");
            }
        } else {
            if (signInButton) signInButton.innerHTML = '<i class="fas fa-sign-in-alt"></i>';
            if (userInfo) userInfo.classList.add("hidden");
            if (usernameDisplay) usernameDisplay.textContent = "";
            const devButton = document.getElementById('devButton');
            if (devButton) devButton.classList.add("hidden");
            linkDurationInfo.textContent = '';
        }
        // Dispatch a custom event when login status changes
        document.dispatchEvent(new Event('loginStatusChanged'));
        updateMaxFileSize();
    }

    function toggleAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) {
            console.error('Admin panel element not found');
            return;
        }
        console.log('Admin panel before toggle:', adminPanel.classList.contains('hidden'));
        adminPanel.classList.toggle('hidden');
        console.log('Admin panel after toggle:', adminPanel.classList.contains('hidden'));
        
        if (!adminPanel.classList.contains('hidden')) {
            console.log('Admin panel should be visible now');
            adminPanel.style.display = 'block'; // Force display
            loadUsers();
            addCloseButtonToAdminPanel();
        } else {
            console.log('Admin panel should be hidden now');
            adminPanel.style.display = 'none'; // Force hide
        }
    }

    function addCloseButtonToAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) return;

        let closeButton = adminPanel.querySelector('.close-button');
        if (!closeButton) {
            closeButton = document.createElement('button');
            closeButton.className = 'close-button';
            closeButton.innerHTML = '&times;';
            closeButton.onclick = toggleAdminPanel;
            adminPanel.insertBefore(closeButton, adminPanel.firstChild);
        }
    }

    function checkAdminPanel() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const adminPanel = document.getElementById('adminPanel');
        const devButton = document.getElementById('devButton');

        console.log('Checking admin panel, current user:', currentUser);

        if (currentUser && currentUser.isDev) {
            if (devButton) {
                console.log('Dev button found, setting up click event');
                devButton.classList.remove('hidden');
                devButton.onclick = toggleAdminPanel;
            } else {
                console.error('Dev button not found in DOM');
            }
        } else {
            if (devButton) {
                devButton.classList.add('hidden');
            }
            if (adminPanel) {
                adminPanel.classList.add('hidden');
            }
        }
    }

    // Call this function when the page loads
    document.addEventListener('DOMContentLoaded', checkAdminPanel);

    document.getElementById('devButton').addEventListener('click', () => {
        const adminPanel = document.getElementById('adminPanel');
        adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
        if (adminPanel.style.display === 'block') {
            loadUsers();
        }
    });

    checkLoginStatus();

    document.querySelectorAll(".close").forEach((closeButton) => {
        closeButton.addEventListener("click", () => {
            closeButton.closest(".popup").classList.add('hidden');
        });
    });

    const fileButtons = document.querySelectorAll(".file-button");
    fileButtons.forEach((button) => {
        button.addEventListener("click", () => {
            button.previousElementSibling.click();
        });
    });

    fileInputs.forEach((input) => {
        input.addEventListener("change", (event) => {
            const fileName = event.target.files[0].name;
            const button = input.nextElementSibling;
            button.textContent = fileName;
        });
    });

    window.addEventListener("click", (e) => {
        if (e.target === authPopup) {
            authPopup.classList.add('hidden');
        }
    });

    function sanitizeInput(input) {
        return input.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    async function loginUser(username, password) {
        const sanitizedUsername = sanitizeInput(username);
        const user = await db.loginUser(sanitizedUsername, password);
        if (user) {
            currentUser = user;
            updateUIForLoggedInUser();
            closeAuthPopup();
            showNotification('Login successful!', 'success');
        } else {
            showNotification('Login failed. Please check your credentials.', 'error');
        }
    }

    function updateUIForUser(user) {
        const userInfo = document.getElementById('userInfo');
        const usernameDisplay = document.getElementById('username-display');
        const devButton = document.getElementById('devButton');
        const linkDurationInfo = document.getElementById('linkDuration');

        if (user) {
            userInfo.classList.remove('hidden');
            usernameDisplay.textContent = user.username;
            
            if (user.premium) {
                usernameDisplay.innerHTML += ' <span class="premium-badge">Premium</span>';
                linkDurationInfo.textContent = 'Links last for 2 months because you have premium';
            } else {
                linkDurationInfo.textContent = 'Links last for 14 days';
            }
            
            if (user.isDev) {
                usernameDisplay.innerHTML += ' <span class="dev-badge">DEV</span>';
                devButton.classList.remove('hidden');
                devButton.addEventListener('click', toggleAdminPanel);
            } else {
                devButton.classList.add('hidden');
                devButton.removeEventListener('click', toggleAdminPanel);
            }
        } else {
            userInfo.classList.add('hidden');
            devButton.classList.add('hidden');
            devButton.removeEventListener('click', toggleAdminPanel);
            linkDurationInfo.textContent = '';
        }
    }

    async function login(username, password) {
        const user = await db.loginUser(username, password);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateUIForUser(user);
            closeAuthPopup();
            showNotification('Logged in successfully!', 'success');
        } else {
            showNotification('Invalid credentials', 'error');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        updateUIForUser(currentUser);
    });

    document.addEventListener('loginStatusChanged', () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        updateUIForUser(currentUser);
    });

    const toggleAuthPassword = document.getElementById("toggleAuthPassword");

/*if (toggleAuthPassword) {
    toggleAuthPassword.addEventListener("click", function() {
        const passwordInput = document.getElementById("auth-password");
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
    });
} else {
    console.warn("Element with ID 'toggleAuthPassword' not found in DOM.");
}*/

    function showPrivacyPolicy() {
        document.getElementById('authForm').classList.add('hidden');
        document.getElementById('privacyPolicyTab').classList.remove('hidden');
    }

    function hidePrivacyPolicy() {
        document.getElementById('authForm').classList.remove('hidden');
        document.getElementById('privacyPolicyTab').classList.add('hidden');
    }

    function togglePrivacyPolicyAgreement(show) {
        const agreementDiv = document.getElementById('privacyPolicyAgreement');
        if (show) {
            agreementDiv.classList.remove('hidden');
        } else {
            agreementDiv.classList.add('hidden');
        }
    }

    /*viewPrivacyPolicyLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPrivacyPolicy();
    });*/

    const backToSignup = document.getElementById('backToSignup');
    if (backToSignup) {
        backToSignup.addEventListener('click', hidePrivacyPolicy);
    }

    function updateMaxFileSize() {
        if (currentUser && currentUser.premium) {
            maxFileSizeElement.textContent = '1.5 GB PREMIUM';
        } else {
            maxFileSizeElement.textContent = '1 GB';
        }
    }

    // Call this function when the page loads
    updateMaxFileSize();

    if (hamburgerMenu && dropdownMenu) {
        hamburgerMenu.addEventListener('click', function (e) {
            e.stopPropagation();
            console.log('Hamburger clicked');
            dropdownMenu.classList.toggle('show');
        });
        document.addEventListener('click', function (e) {
            if (!dropdownMenu.contains(e.target) && !hamburgerMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
});

// Forest-themed falling leaves effect
(function() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, leaves = [];
  const numLeaves = 40;
  const leafColors = ['#b983ff', '#8f5cff', '#6a994e', '#386641', '#a7c957', '#f2e8cf'];
  const leafShapes = [ // simple leaf shapes (ellipses)
    {rx: 10, ry: 4},
    {rx: 8, ry: 3},
    {rx: 12, ry: 5}
  ];

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }

  function createLeaf() {
    const shape = leafShapes[Math.floor(Math.random() * leafShapes.length)];
    return {
      x: Math.random() * w,
      y: -20 - Math.random() * h,
      speed: 1 + Math.random() * 2,
      drift: (Math.random() - 0.5) * 1.5,
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      rx: shape.rx,
      ry: shape.ry,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.04
    };
  }

  function initLeaves() {
    leaves = [];
    for (let i = 0; i < numLeaves; i++) {
      leaves.push(createLeaf());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < numLeaves; i++) {
      let leaf = leaves[i];
      leaf.y += leaf.speed;
      leaf.x += leaf.drift;
      leaf.angle += leaf.spin;
      if (leaf.y > h + 20 || leaf.x < -20 || leaf.x > w + 20) {
        leaves[i] = createLeaf();
        leaves[i].y = -20;
      }
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.rx, leaf.ry, 0, 0, 2 * Math.PI);
      ctx.fillStyle = leaf.color;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  initLeaves();
  draw();
})();