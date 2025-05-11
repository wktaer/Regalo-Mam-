// Variables globales
let isCardOpen = false;
let currentSection = 'cover';
let audioPlaying = false;
let confettiActive = false;
let helpPanelOpen = false;

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos principales
    const loadingScreen = document.querySelector('.loading-screen');
    const mainScreen = document.querySelector('.main-screen');
    const sections = document.querySelectorAll('section');
    const coverSection = document.querySelector('.cover');
    const messageSection = document.querySelector('.message-section');
    const gallerySection = document.querySelector('.gallery-section');
    const poemSection = document.querySelector('.poem-section');
    const openCardButton = document.querySelector('.primary-button');
    const backButtons = document.querySelectorAll('.back-button');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const photoModal = document.querySelector('.photo-modal');
    const closeModalButton = document.querySelector('.close-modal');
    const modalImage = document.querySelector('.modal-content img');
    const modalCaption = document.querySelector('.modal-caption h3');
    const modalDescription = document.querySelector('.modal-caption p');
    const helpButton = document.querySelector('.help-button');
    const helpPanel = document.querySelector('.help-panel');
    const closeHelpButton = document.querySelector('.close-help');
    
    // Audio
    const bgMusic = new Audio('https://assets.mixkit.co/music/preview/mixkit-sweet-and-happy-14.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    
    // Inicialización
    init();
    
    // Funciones de inicialización
    function init() {
        // Simular tiempo de carga
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                mainScreen.style.display = 'block';
                coverSection.classList.add('active');
                
                // Crear corazones flotantes
                createFloatingHearts();
                
                // Detectar si es dispositivo Android
                detectAndroid();
            }, 500);
        }, 2000);
        
        // Configurar eventos
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Botón para abrir la tarjeta
        openCardButton.addEventListener('click', function() {
            navigateTo('message');
            playMusic();
            showConfetti();
            vibrate();
        });
        
        // Botones de navegación
        document.querySelectorAll('[data-navigate]').forEach(button => {
            button.addEventListener('click', function() {
                const target = this.getAttribute('data-navigate');
                navigateTo(target);
                vibrate(50);
            });
        });
        
        // Botones de retroceso
        backButtons.forEach(button => {
            button.addEventListener('click', function() {
                navigateBack();
                vibrate(50);
            });
        });
        
        // Elementos de galería
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                showMemory(this);
                vibrate(50);
            });
        });
        
        // Cerrar modal
        closeModalButton.addEventListener('click', function() {
            closeModal();
            vibrate(50);
        });
        
        // Cerrar modal al hacer clic fuera del contenido
        photoModal.addEventListener('click', function(e) {
            if (e.target === photoModal) {
                closeModal();
            }
        });
        
        // Ayuda
        helpButton.addEventListener('click', function() {
            toggleHelpPanel();
            vibrate(50);
        });
        
        closeHelpButton.addEventListener('click', function() {
            toggleHelpPanel();
            vibrate(50);
        });
        
        // Efectos táctiles
        setupTouchEffects();
        
        // Eventos de teclado
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (photoModal.classList.contains('show')) {
                    closeModal();
                } else if (helpPanelOpen) {
                    toggleHelpPanel();
                } else if (currentSection !== 'cover') {
                    navigateBack();
                }
            }
        });
    }
    
    // Navegación entre secciones
    function navigateTo(sectionName) {
        const targetSection = document.querySelector(`.${sectionName}-section`) || 
                             document.querySelector(`.${sectionName}`);
        
        if (!targetSection) return;
        
        // Guardar historial para el botón de retroceso
        const previousSection = currentSection;
        currentSection = sectionName;
        
        // Ocultar sección actual
        sections.forEach(section => {
            if (section.classList.contains('active')) {
                section.classList.remove('active');
                section.classList.add('slide-out-left');
                setTimeout(() => {
                    section.classList.remove('slide-out-left');
                }, 500);
            }
        });
        
        // Mostrar nueva sección
        setTimeout(() => {
            targetSection.classList.add('active', 'slide-in-right');
            setTimeout(() => {
                targetSection.classList.remove('slide-in-right');
            }, 500);
        }, 100);
        
        // Analítica
        logNavigation(previousSection, sectionName);
    }
    
    function navigateBack() {
        if (currentSection === 'message') {
            navigateTo('cover');
        } else if (currentSection === 'gallery') {
            navigateTo('message');
        } else if (currentSection === 'poem') {
            navigateTo('gallery');
        } else {
            navigateTo('cover');
        }
    }
    
    // Funciones para la galería y memorias
    function showMemory(memory) {
        const imageUrl = memory.getAttribute('data-image') || memory.querySelector('img').src;
        const title = memory.getAttribute('data-title') || 'Recuerdo especial';
        const description = memory.getAttribute('data-description') || 'Un momento inolvidable juntos.';
        
        modalImage.src = imageUrl;
        modalCaption.textContent = title;
        modalDescription.textContent = description;
        
        photoModal.classList.add('show');
        
        // Precarga de imagen
        const img = new Image();
        img.src = imageUrl;
        img.onload = function() {
            modalImage.src = imageUrl;
        };
        
        // Analítica
        logEvent('view_memory', { memory_title: title });
    }
    
    function closeModal() {
        photoModal.classList.remove('show');
    }
    
    // Funciones de música y efectos
    function playMusic() {
        if (!audioPlaying) {
            bgMusic.play().catch(error => {
                console.log('Reproducción automática bloqueada:', error);
                // Mostrar un botón para reproducir música manualmente
                showPlayMusicButton();
            });
            audioPlaying = true;
        }
    }
    
    function showPlayMusicButton() {
        const musicButton = document.createElement('button');
        musicButton.classList.add('secondary-button');
        musicButton.style.position = 'fixed';
        musicButton.style.bottom = '70px';
        musicButton.style.left = '20px';
        musicButton.style.zIndex = '100';
        
        musicButton.addEventListener('click', function() {
            bgMusic.play();
            audioPlaying = true;
            this.remove();
            vibrate(50);
        });
        
        document.body.appendChild(musicButton);
    }
    
    function showConfetti() {
        if (confettiActive) return;
        
        confettiActive = true;
        
        // Crear contenedor de confeti si no existe
        let confettiContainer = document.querySelector('.confetti-container');
        if (!confettiContainer) {
            confettiContainer = document.createElement('div');
            confettiContainer.className = 'confetti-container';
            confettiContainer.style.position = 'fixed';
            confettiContainer.style.top = '0';
            confettiContainer.style.left = '0';
            confettiContainer.style.width = '100%';
            confettiContainer.style.height = '100%';
            confettiContainer.style.pointerEvents = 'none';
            confettiContainer.style.zIndex = '1000';
            document.body.appendChild(confettiContainer);
        }
        
        // Crear piezas de confeti
        const colors = ['#ff6b95', '#ffa5c0', '#d23669', '#6b4de6', '#ffffff'];
        const totalConfetti = 100;
        
        for (let i = 0; i < totalConfetti; i++) {
            setTimeout(() => {
                createConfettiPiece(confettiContainer, colors);
            }, i * 20);
        }
        
        // Limpiar confeti después de un tiempo
        setTimeout(() => {
            confettiActive = false;
            confettiContainer.innerHTML = '';
        }, 5000);
    }
    
    function createConfettiPiece(container, colors) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.className = 'confetti-piece';
        confetti.style.position = 'absolute';
        confetti.style.backgroundColor = color;
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.top = '-10px';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.opacity = '1';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        
        container.appendChild(confetti);
        
        // Animación de caída
        const animationDuration = Math.random() * 3 + 2;
        confetti.animate([
            { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: animationDuration * 1000,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
        });
        
        // Eliminar después de la animación
        setTimeout(() => {
            confetti.remove();
        }, animationDuration * 1000);
    }
    
    // Funciones para corazones flotantes
    function createFloatingHearts() {
        const floatingHearts = document.querySelector('.floating-hearts');
        
        // Si ya existen corazones, no crear más
        if (floatingHearts.children.length > 5) return;
        
        // Crear corazones adicionales dinámicamente
        for (let i = 0; i < 5; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.style.left = `${Math.random() * 80 + 10}%`;
            heart.style.bottom = '-20px';
            heart.style.animationDuration = `${Math.random() * 10 + 10}s`;
            heart.style.animationDelay = `${Math.random() * 10}s`;
            
            floatingHearts.appendChild(heart);
        }
    }
    
    // Panel de ayuda
    function toggleHelpPanel() {
        helpPanel.classList.toggle('show');
        helpPanelOpen = !helpPanelOpen;
    }
    
    // Funciones específicas para móviles
    function setupTouchEffects() {
        const touchableElements = document.querySelectorAll('button, .gallery-item');
        
        touchableElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            element.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
            
            element.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            });
        });
    }
    
    function vibrate(duration = 100) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    
    // Detección de dispositivo Android
    function detectAndroid() {
        const isAndroid = /Android/i.test(navigator.userAgent);
        if (isAndroid) {
            document.body.classList.add('android-device');
            
            // Ajustes específicos para Android
            setupAndroidSpecifics();
        }
    }
    
    function setupAndroidSpecifics() {
        // Ajustar altura para compensar la barra de navegación
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Reajustar al cambiar la orientación
        window.addEventListener('resize', () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        });
        
        // Mejorar rendimiento en Android
        document.querySelectorAll('.floating-heart').forEach((heart, index) => {
            if (index > 3) heart.style.display = 'none';
        });
        
        // Ajustes para pantallas pequeñas
        if (window.innerWidth < 360) {
            document.body.classList.add('small-screen');
        }
    }
    
    // Analítica básica
    function logNavigation(from, to) {
        console.log(`Navegación: ${from} -> ${to}`);
        // Aquí se podría implementar una analítica real
    }
    
    function logEvent(eventName, params) {
        console.log(`Evento: ${eventName}`, params);
        // Aquí se podría implementar una analítica real
    }
});

// Precargar imágenes para mejorar la experiencia
function preloadImages() {
    const imageUrls = [
        // Aquí se pueden listar URLs de imágenes a precargar
        // Por ejemplo: 'images/mom1.jpg', 'images/mom2.jpg', etc.
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Llamar a preloadImages cuando la ventana termine de cargar
window.addEventListener('load', preloadImages);

// Gestión de errores
window.addEventListener('error', function(e) {
    console.error('Error capturado:', e.message);
    // Aquí se podría implementar un sistema de registro de errores
});

// Función para detectar conexión lenta y optimizar la experiencia
function checkConnectionSpeed() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
        const type = connection.effectiveType;
        
        if (type === 'slow-2g' || type === '2g') {
            document.body.classList.add('low-bandwidth');
            console.log('Conexión lenta detectada, optimizando experiencia');
        }
    }
}

// Verificar velocidad de conexión si está disponible
if (navigator.connection) {
    checkConnectionSpeed();
}

// Gestión de orientación para dispositivos móviles
window.addEventListener('orientationchange', function() {
    if (window.orientation === 90 || window.orientation === -90) {
        document.body.classList.add('landscape-mode');
    } else {
        document.body.classList.remove('landscape-mode');
    }
});

// Comprobar orientación inicial
if (window.orientation === 90 || window.orientation === -90) {
    document.body.classList.add('landscape-mode');
}

// Función para compartir la tarjeta (si el navegador lo soporta)
function shareCard() {
    if (navigator.share) {
        navigator.share({
            title: 'Tarjeta del Día de las Madres',
            text: '¡Te envío esta tarjeta especial para el Día de las Madres!',
            url: window.location.href
        })
        .then(() => console.log('Compartido con éxito'))
        .catch((error) => console.log('Error al compartir', error));
    } else {
        alert('Tu navegador no soporta la función de compartir');
    }
}

// Exportar funciones que podrían ser llamadas desde HTML
window.shareCard = shareCard;
// Sistema de partículas interactivas
function createParticleSystem() {
    const container = document.createElement('div');
    container.className = 'particle-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '10';
    document.body.appendChild(container);
    
    // Seguimiento del mouse/toque
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        createParticle(mouseX, mouseY);
    });
    
    document.addEventListener('touchmove', function(e) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        createParticle(mouseX, mouseY);
    }, { passive: true });
    
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'mouse-particle';
        
        // Estilo aleatorio para la partícula
        const size = Math.random() * 15 + 5;
        const color = `hsl(${Math.random() * 60 + 330}, 100%, 70%)`;
        const rotation = Math.random() * 360;
        
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.background = color;
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        particle.style.transform = `rotate(${rotation}deg)`;
        particle.style.opacity = '0.8';
        particle.style.pointerEvents = 'none';
        
        container.appendChild(particle);
        
        // Animación de la partícula
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 2 + 1;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let opacity = 0.8;
        let posX = x;
        let posY = y;
        let scale = 1;
        
        function animateParticle() {
            if (opacity <= 0) {
                particle.remove();
                return;
            }
            
            posX += vx;
            posY += vy;
            opacity -= 0.02;
            scale -= 0.02;
            
            particle.style.left = `${posX}px`;
            particle.style.top = `${posY}px`;
            particle.style.opacity = opacity;
            particle.style.transform = `rotate(${rotation}deg) scale(${scale})`;
            
            requestAnimationFrame(animateParticle);
        }
        
        requestAnimationFrame(animateParticle);
    }
}
// Animaciones de entrada mejoradas
function setupEnhancedAnimations() {
    // Observador de intersección para detectar cuando los elementos son visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    // Observar elementos para animarlos cuando sean visibles
    document.querySelectorAll('.message-text p, .poem-text p, .gallery-item, .signature').forEach(el => {
        observer.observe(el);
    });
    
    // Animar elementos secuencialmente
    function animateSequentially(selector, delay = 100) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('animated');
            }, index * delay);
        });
    }
    
    // Aplicar animaciones secuenciales cuando se muestra una sección
    document.querySelectorAll('[data-navigate]').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-navigate');
            setTimeout(() => {
                if (target === 'gallery') {
                    animateSequentially('.gallery-item', 150);
                } else if (target === 'poem') {
                    animateSequentially('.poem-text p', 300);
                } else if (target === 'message') {
                    animateSequentially('.message-text p', 200);
                }
            }, 500);
        });
    });
}
// Efectos 3D y parallax
function setup3DEffects() {
    // Efecto parallax en la portada
    const cover = document.querySelector('.cover');
    const coverContent = document.querySelector('.cover-content');
    const floatingHearts = document.querySelector('.floating-hearts');
    
    document.addEventListener('mousemove', function(e) {
        if (!cover.classList.contains('active')) return;
        
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        
        coverContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
        floatingHearts.style.transform = `translate(${-moveX/2}px, ${-moveY/2}px)`;
    });
    
    // Efecto 3D en las fotos de la galería
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xPercent = x / rect.width;
            const yPercent = y / rect.height;
            
            const rotateY = (xPercent - 0.5) * 20;
            const rotateX = (0.5 - yPercent) * 20;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            this.querySelector('img').style.transform = `translateZ(20px)`;
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.querySelector('img').style.transform = '';
        });
    });
}
// Confeti mejorado
function createEnhancedConfetti() {
    const shapes = ['circle', 'square', 'triangle', 'heart'];
    const colors = ['#ff6b95', '#ffa5c0', '#d23669', '#6b4de6', '#ffffff', '#ffcc00'];
    
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'enhanced-confetti-container';
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '1000';
    document.body.appendChild(confettiContainer);
    
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            createConfettiPiece();
        }, i * 30);
    }
    
    function createConfettiPiece() {
        const confetti = document.createElement('div');
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 15 + 5;
        
        confetti.className = `confetti-piece confetti-${shape}`;
        confetti.style.position = 'absolute';
        confetti.style.top = '-20px';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.zIndex = '1000';
        
        if (shape === 'circle') {
            confetti.style.borderRadius = '50%';
        } else if (shape === 'heart') {
            confetti.style.backgroundColor = 'transparent';
            confetti.style.width = '0';
            confetti.style.height = '0';
            confetti.style.borderBottom = `${size}px solid ${color}`;
            confetti.style.borderLeft = `${size/2}px solid transparent`;
            confetti.style.borderRight = `${size/2}px solid transparent`;
            confetti.style.transform = 'rotate(-45deg)';
        } else if (shape === 'triangle') {
            confetti.style.width = '0';
            confetti.style.height = '0';
            confetti.style.borderLeft = `${size/2}px solid transparent`;
            confetti.style.borderRight = `${size/2}px solid transparent`;
            confetti.style.borderBottom = `${size}px solid ${color}`;
        }
        
        confettiContainer.appendChild(confetti);
        
        // Física del confeti
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 3 + 2;
        const rotationSpeed = Math.random() * 10 - 5;
        
        let posX = parseFloat(confetti.style.left);
        let posY = -20;
        let rotation = 0;
        let opacity = 1;
        
        function animateConfetti() {
            posY += velocity;
            posX += Math.sin(angle) * 2;
            rotation += rotationSpeed;
            
            if (posY > window.innerHeight) {
                confetti.remove();
                return;
            }
            
            if (posY > window.innerHeight - 100) {
                opacity -= 0.02;
                confetti.style.opacity = opacity;
            }
            
            confetti.style.top = `${posY}px`;
            confetti.style.left = `${posX}%`;
            confetti.style.transform = `rotate(${rotation}deg)`;
            
            requestAnimationFrame(animateConfetti);
        }
        
        requestAnimationFrame(animateConfetti);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    // Código existente...
    
    // Inicializar las nuevas funciones
    createParticleSystem();
    setupEnhancedAnimations();
    setup3DEffects();
    
    // Modificar la función showConfetti para usar el confeti mejorado
    function showConfetti() {
        if (confettiActive) return;
        confettiActive = true;
        createEnhancedConfetti();
        
        // Limpiar confeti después de un tiempo
        setTimeout(() => {
            confettiActive = false;
            const container = document.querySelector('.enhanced-confetti-container');
            if (container) container.innerHTML = '';
        }, 8000);
    }
});