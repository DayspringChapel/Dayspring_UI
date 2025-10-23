import { authenticate } from "./authentication.js";
document.addEventListener("DOMContentLoaded", async() => {
    const form = document.querySelector(".login-form")
    if(form)
    {
        form.addEventListener("submit", async(e) => {
            e.preventDefault();
            const userName = document.querySelector("#userNameOrEmail");
            const password = document.querySelector("#password");
            if(userNameOrEmail && password)
            {
                console.log(userNameOrEmail.value)
                console.log(password.value)            
                    
                const response = await authenticate(userNameOrEmail.value, password.value,"https://dayspring-backend-4ar8.onrender.com/api/User/login");
                console.log(response);
                if(response.status )
                    {
                        if(userNameOrEmail === "SuperAdmin" || userNameOrEmail === "superadmin@dayspring.com")
                        {
                            Swal.fire({
                                title: 'Welcome!',
                                text: `Welcome SuperAdmin`,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                timer: 3000,  // Close modal after 3 seconds
                                willClose: () => {
                                location.href = 'dashboard.html';  // Redirect after modal closes
                                }
                            });
                        }
                        else
                        {
                            Swal.fire({
                                title: 'Welcome!',
                                text: `Welcome ${userName}`,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                timer: 3000,  // Close modal after 3 seconds
                                willClose: () => {
                                location.href = 'dashboard.html';  // Redirect after modal closes
                                }
                            });
                        }
                }
                else
                    {
                        Swal.fire({
                            title: 'Oops...',
                            text: 'Sorry!\nEmail or Password not valid',
                            icon: 'error',
                            confirmButtonText: 'Try again',
                            timer: 3000,  // Close modal after 3 seconds
                            willClose: () => {
                            }
                        });
                }
            }                               
        })
    }
    
    console.log("Entered")
    
})
