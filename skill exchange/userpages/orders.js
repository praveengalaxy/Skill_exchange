// Show the order popup
function showOrderPopup() {
    document.getElementById('order-popup').classList.remove('hidden');
}

// Hide the order popup
function hidePopup() {
    document.getElementById('order-popup').classList.add('hidden');
}

// Handle order form submission
document.getElementById('order-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const orderData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        price: parseFloat(document.getElementById('price').value),
        location: document.getElementById('location').value
    };

    // Submit the order via API
    fetch('/placeOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Order placed successfully!');
            // Display the new order details
            const newOrder = data.newOrder;
            const orderInfo = `
                <h4>New Order Details</h4>
                <p><strong>Title:</strong> ${newOrder.title}</p>
                <p><strong>Description:</strong> ${newOrder.description}</p>
                <p><strong>Category:</strong> ${newOrder.category}</p>
                <p><strong>Price:</strong> $${newOrder.price}</p>
                <p><strong>Location:</strong> ${newOrder.location}</p>
                <p><strong>Status:</strong> ${newOrder.status}</p>
                <p><strong>Published At:</strong> ${new Date(newOrder.published_at).toLocaleString()}</p>
            `;
            document.getElementById('orderDetails').innerHTML = orderInfo;
            hidePopup();
            // Refresh the order list on the dashboard
            updateOrderList(data.orders);
        } else {
            alert('Error placing order: ' + data.message);
        }
    })
    .catch(error => {
        alert('Error placing order: ' + error.message);
    });
});

// Update the order list (dashboard)
function updateOrderList(orders) {
    let orderListHTML = '';
    if (orders.length > 0) {
        orders.forEach(order => {
            orderListHTML += `
                <div class="order-item">
                    <h4>${order.title}</h4>
                    <p><strong>Description:</strong> ${order.description}</p>
                    <p><strong>Category:</strong> ${order.category}</p>
                    <p><strong>Price:</strong> $${order.price}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Location:</strong> ${order.location}</p>
                    <p><strong>Published At:</strong> ${new Date(order.published_at).toLocaleString()}</p>
                </div>
            `;
        });
    } else {
        orderListHTML = `<p>No orders placed yet.</p>`;
    }
    document.getElementById('order-list').innerHTML = orderListHTML;
}

// Fetch and display the user's orders on page load
document.addEventListener('DOMContentLoaded', function() {
    fetch('/getUserOrders')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateOrderList(data.orders);
        } else {
            document.getElementById('order-list').innerHTML = `<p>${data.message}</p>`;
        }
    })
    .catch(error => {
        console.error('Error fetching orders:', error);
    });
});
