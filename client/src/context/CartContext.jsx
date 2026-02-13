import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Load cart from local storage on init
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to local storage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        const itemKey = `${product._id}-${product.size || 'default'}`;
        const existingItem = cart.find(item => `${item._id}-${item.size || 'default'}` === itemKey);

        if (existingItem) {
            setCart(cart.map(item =>
                `${item._id}-${item.size || 'default'}` === itemKey
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        toast.success(`Added ${product.name} (${product.size || 'default'}) to cart!`);
    };

    const removeFromCart = (productId, size) => {
        const itemKey = `${productId}-${size || 'default'}`;
        setCart(cart.filter(item => `${item._id}-${item.size || 'default'}` !== itemKey));
        toast.error('Removed from cart');
    };

    const clearCart = () => {
        setCart([]);
    };

    const updateQuantity = (productId, size, amount) => {
        const itemKey = `${productId}-${size || 'default'}`;
        setCart(cart.map(item => {
            if (`${item._id}-${item.size || 'default'}` === itemKey) {
                const newQty = Math.max(1, item.quantity + amount);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };


    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
