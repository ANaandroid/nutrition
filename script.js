/**
 * NUTRIJOSEPH - Shopping Cart JavaScript
 * Handles cart functionality, product management, and UI interactions
 */

// ===================================
// Cart State Management
// ===================================
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartCount();
        this.attachEventListeners();
    }

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('nutrijoseph_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('nutrijoseph_cart', JSON.stringify(this.items));
    }

    // Add item to cart
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product.name} añadido al carrito`);
        this.animateCartButton();
    }

    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
    }

    // Get total items count
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Get total price
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Update cart count badge
    updateCartCount() {
        const cartCountElement = document.getElementById('cartCount');
        const totalItems = this.getTotalItems();
        
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
            
            // Add animation when count changes
            cartCountElement.style.animation = 'none';
            setTimeout(() => {
                cartCountElement.style.animation = 'pulse 2s infinite';
            }, 10);
        }
    }

    // Animate cart button when item is added
    animateCartButton() {
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                cartBtn.style.animation = '';
            }, 500);
        }
    }

    // Show notification
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #7cb342, #689f38);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 600;
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Render cart items in modal
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const cartModalFooter = document.getElementById('cartModalFooter');
        const totalAmountElement = document.getElementById('totalAmount');

        if (this.items.length === 0) {
            emptyCart.style.display = 'block';
            cartItemsContainer.innerHTML = '';
            cartModalFooter.style.display = 'none';
        } else {
            emptyCart.style.display = 'none';
            cartModalFooter.style.display = 'block';
            
            cartItemsContainer.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <p class="cart-item-price">S/${item.price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <button class="remove-item" data-id="${item.id}" aria-label="Eliminar ${item.name}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

            // Update total
            totalAmountElement.textContent = `S/${this.getTotalPrice().toFixed(2)}`;

            // Attach remove button listeners
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.currentTarget.getAttribute('data-id');
                    this.removeItem(productId);
                });
            });
        }
    }

    // Attach event listeners
    attachEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const product = {
                    id: button.getAttribute('data-id'),
                    name: button.getAttribute('data-name'),
                    price: button.getAttribute('data-price'),
                    image: button.getAttribute('data-image')
                };
                this.addItem(product);
            });
        });

        // Cart button - open modal
        const cartBtn = document.getElementById('cartBtn');
        const cartModal = document.getElementById('cartModal');
        
        if (cartBtn && cartModal) {
            cartBtn.addEventListener('click', () => {
                cartModal.classList.add('active');
                this.renderCartItems();
            });
        }

        // Close modal button
        const closeModal = document.getElementById('closeModal');
        if (closeModal && cartModal) {
            closeModal.addEventListener('click', () => {
                cartModal.classList.remove('active');
            });
        }

        // Close modal when clicking outside
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    cartModal.classList.remove('active');
                }
            });
        }

        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length > 0) {
                    alert(`Total a pagar: S/${this.getTotalPrice().toFixed(2)}\n\n¡Gracias por tu compra en NUTRIJOSEPH!`);
                    this.items = [];
                    this.saveCart();
                    this.updateCartCount();
                    this.renderCartItems();
                }
            });
        }
    }
}

// ===================================
// Product Filtering
// ===================================
class ProductFilter {
    constructor() {
        this.init();
    }

    init() {
        const filterSelect = document.getElementById('categoryFilter');
        
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterProducts(e.target.value);
            });
        }
    }

    filterProducts(category) {
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const productCategory = product.getAttribute('data-category');
            
            if (category === 'all' || productCategory === category) {
                product.style.display = 'block';
                product.style.animation = 'fadeIn 0.6s ease-out';
            } else {
                product.style.display = 'none';
            }
        });
    }
}

// ===================================
// Smooth Scrolling
// ===================================
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                if (href !== '#' && href.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    
                    if (target) {
                        const headerOffset = 80;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });

                        // Update active nav link
                        document.querySelectorAll('.nav-link').forEach(link => {
                            link.classList.remove('active');
                        });
                        anchor.classList.add('active');
                    }
                }
            });
        });
    }
}

// ===================================
// Newsletter Form
// ===================================
class NewsletterForm {
    constructor() {
        this.init();
    }

    init() {
        const forms = document.querySelectorAll('.newsletter-form, .footer-newsletter-form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = form.querySelector('input[type="email"]');
                
                if (emailInput && emailInput.value) {
                    this.showSuccessMessage(emailInput.value);
                    emailInput.value = '';
                }
            });
        });
    }

    showSuccessMessage(email) {
        const notification = document.createElement('div');
        notification.className = 'newsletter-notification';
        notification.innerHTML = `
            <i class="fas fa-envelope-open-text"></i>
            <span>¡Gracias por suscribirte! Revisa tu email: ${email}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 600;
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }
}

// ===================================
// Header Scroll Effect
// ===================================
class HeaderScroll {
    constructor() {
        this.init();
    }

    init() {
        const header = document.querySelector('.header');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }

            lastScroll = currentScroll;
        });
    }
}

// ===================================
// Add CSS Animations
// ===================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }

    @keyframes bounce {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.15);
        }
    }
`;
document.head.appendChild(style);

// ===================================
// Initialize Application
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    const cart = new ShoppingCart();
    const filter = new ProductFilter();
    const smoothScroll = new SmoothScroll();
    const newsletter = new NewsletterForm();
    const headerScroll = new HeaderScroll();

    console.log('NUTRIJOSEPH - Sistema de carrito inicializado ✓');
});
