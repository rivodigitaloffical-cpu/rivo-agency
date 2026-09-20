document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Smart Navbar Logic
    let lastScrollY = window.scrollY;
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            // Scrolling down
            header.classList.add('nav-hidden');
        } else {
            // Scrolling up
            header.classList.remove('nav-hidden');
        }
        lastScrollY = window.scrollY;
    });

    // Dynamic Data Fetch (Admin Panel Integration)
    fetch('/api/settings')
        .then(response => response.json())
        .then(data => {
            // Render Slider
            const sliderContainer = document.getElementById('dynamic-slider');
            if (sliderContainer && data.slides) {
                sliderContainer.innerHTML = ''; // clear existing
                data.slides.forEach((slideImage, index) => {
                    const div = document.createElement('div');
                    div.className = `slide ${index === 0 ? 'active' : ''}`;
                    div.style.backgroundImage = `url('${slideImage}')`;
                    sliderContainer.appendChild(div);
                });
                initSlider(); // Start the slider logic after injecting slides
            }

            // Render Video Section
            const videoContainer = document.getElementById('dynamic-video');
            if (videoContainer && data.videoThumb) {
                videoContainer.innerHTML = `<img src="${data.videoThumb}" alt="Video Thumbnail">`;
                videoContainer.onclick = () => {
                    window.open(data.videoLink, '_blank');
                };
            }
        })
        .catch(err => {
            console.log('Running statically without server or error fetching data.');
            initSlider();
        });

    // Hero Slider Logic
    function initSlider() {
        const slides = document.querySelectorAll('.slide');
        if (slides.length === 0) return;

        let currentSlide = 0;
        const slideInterval = 5000; // 5 seconds per slide

        function nextSlide() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        setInterval(nextSlide, slideInterval);
    }

    // Custom Toast Notification Function
    function showToast(message) {
        let toast = document.getElementById("custom-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "custom-toast";
            toast.className = "toast-notification";
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fas fa-check-circle toast-icon"></i> <span>${message}</span>`;
        
        // Trigger reflow to restart animation if needed
        toast.classList.remove("show");
        void toast.offsetWidth; 
        
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 4000);
    }

    // Contact Form submission via FormSubmit (No Email App Required)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.textContent = 'Sending...';
            btn.disabled = true;

            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const service = document.getElementById('service').value;
            const message = document.getElementById('message').value;

            // Send via FormSubmit AJAX
            fetch("https://formsubmit.co/ajax/rivodigitaloffical@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    service: service,
                    message: message
                })
            })
            .then(response => response.json())
            .then(data => {
                showToast("Thank you! Your message has been sent successfully.");
                contactForm.reset();
            })
            .catch(error => {
                showToast("Something went wrong. Please try again.");
                console.error(error);
            })
            .finally(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            });
        });
    }
});
