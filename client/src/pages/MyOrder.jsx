

import React from 'react'
import { useSelector } from 'react-redux'
import NoData from "../../components/NoData.jsx"
import { format } from 'date-fns'

const MyOrder = () => {
  const orders = useSelector(state => state.orders.order);
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM d, yyyy - h:mm a')
  }

  // Group orders by createdAt time
  const groupOrdersByTime = () => {
    const groupedOrders = {};
    
    orders.forEach(order => {
      const timeKey = order.createdAt;
      if (!groupedOrders[timeKey]) {
        groupedOrders[timeKey] = [];
      }
      groupedOrders[timeKey].push(order);
    });
    
    return Object.values(groupedOrders);
  };

  const groupedOrders = groupOrdersByTime();

  // Calculate total amount for grouped orders
  const calculateGroupTotal = (orders) => {
    return orders.reduce((total, order) => total + order.totalAmt, 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>My Orders</h1>
        <p className='text-gray-500 mt-1'>View your order history and track shipments</p>
      </div>
      
      {!orders[0] && <NoData />}
      
      <div className="space-y-6">
        {groupedOrders.map((orderGroup, groupIndex) => (
          <div key={groupIndex} className='bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100'>
            {/* Order Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <p className="text-sm text-gray-500">Order #</p>
                <p className="font-medium text-gray-800">
                  {orderGroup[0]?.orderId}
                  {orderGroup.length > 1 && ` (${orderGroup.length} items)`}
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <p className="text-sm text-gray-500">Placed on</p>
                <p className="font-medium text-gray-800">{formatDate(orderGroup[0].createdAt)}</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  orderGroup.every(o => o.payment_status === 'paid') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {orderGroup.every(o => o.payment_status === 'paid') ? 'All Paid' : 'Pending Items'}
                </span>
              </div>
            </div>
            
            {/* Products List */}
            <div className="p-4 md:p-6 space-y-4">
              <h4 className="font-medium text-gray-800">Products ({orderGroup.length})</h4>
              {orderGroup.map((order, orderIndex) => (
                <div key={orderIndex} className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-b-0">
                  <img 
                    src={order.product_details.image[0]} 
                    className='w-16 h-16 object-cover rounded border border-gray-200'
                    alt={order.product_details.name} 
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{order.product_details.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">Quantity: 1</p>
                    <p className="text-gray-500 text-sm">Price: ₹{order.subTotalAmt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Order #{order.orderId}</p>
                    <p className={`text-xs font-medium ${
                      order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50">
              <h4 className="font-medium text-gray-800 mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({orderGroup.length} items)</span>
                  <span className="text-gray-800">₹{calculateGroupTotal(orderGroup)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-800">₹0</span>
                </div>
                <div className="flex justify-between font-medium border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-800">₹{calculateGroupTotal(orderGroup)}</span>
                </div>
              </div>
            </div>
            
            {/* Delivery Address */}
            <div className="p-4 md:p-6 border-t border-gray-100">
              <h4 className="font-medium text-gray-800 mb-3">Delivery Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-800 font-medium">{orderGroup[0].delivery_address.address_line}</p>
                  <p className="text-gray-600">{orderGroup[0].delivery_address.city}, {orderGroup[0].delivery_address.state}</p>
                  <p className="text-gray-600">{orderGroup[0].delivery_address.pincode}</p>
                  <p className="text-gray-600">{orderGroup[0].delivery_address.country}</p>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Contact Information</p>
                  <p className="text-gray-600">Mobile: {orderGroup[0].delivery_address.mobile}</p>
                </div>
              </div>
            </div>
            
            {/* Order Actions */}
            <div className="p-4 border-t border-gray-100 flex justify-end space-x-3">
              <button className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Track Orders
              </button>
              <button className="cursor-pointer px-4 py-2 bg-violet-600 rounded-md text-sm font-medium text-white hover:bg-violet-700">
                View Invoices
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyOrder