import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from '../../utils/Axios';
import SummaryApi from '../config/summaryApi';
import toast from 'react-hot-toast';

const Success = () => {
  const location = useLocation();
  const message = location?.state?.text || "Payment completed successfully.";
  const { fetchOrder, fetchCartItems } = useGlobalContext();
  const [isVerifying, setIsVerifying] = useState(false);
  const hasVerifiedRef = useRef(false); // Track if we've already verified
  const toastShownRef = useRef(false); // Track if toast has been shown
  
  // Get session_id from URL query params
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Prevent multiple executions
    if (hasVerifiedRef.current) {
      return;
    }

    hasVerifiedRef.current = true;
    let pollTimeoutId = null;
    let isMounted = true;

    const verifyAndFetchOrders = async () => {
      // First, try to fetch orders immediately
      if (fetchOrder && isMounted) {
        await fetchOrder();
      }
      if (fetchCartItems && isMounted) {
        await fetchCartItems();
      }

      // If we have a session_id and it's an online payment, verify the order
      if (sessionId && isMounted) {
        setIsVerifying(true);
        let attempts = 0;
        const maxAttempts = 5;
        const pollInterval = 2000; // 2 seconds

        const pollForOrder = async () => {
          if (!isMounted) return;

          try {
            // Check if order exists by fetching orders first
            if (fetchOrder) {
              await fetchOrder();
            }

            // Try to verify/create order from session
            const verifyResponse = await Axios({
              ...SummaryApi.verifyOrderSession,
              data: { session_id: sessionId }
            });

            if (verifyResponse.data.success && isMounted) {
              setIsVerifying(false);
              
              // Only show toast once
              if (!toastShownRef.current) {
                toast.success("Order confirmed!");
                toastShownRef.current = true;
              }
              
              // Fetch updated orders and cart
              if (fetchOrder) {
                await fetchOrder();
              }
              if (fetchCartItems) {
                await fetchCartItems();
              }
              // Stop polling - order is confirmed
              return;
            }
          } catch (error) {
            // Log error but continue polling
            console.log("Order verification attempt:", attempts + 1, error.message);
          }

          attempts++;
          if (attempts < maxAttempts && isMounted) {
            pollTimeoutId = setTimeout(pollForOrder, pollInterval);
          } else if (isMounted) {
            setIsVerifying(false);
            console.warn("Order verification timeout - webhook should process it");
            // Still fetch orders in case webhook processed it
            if (fetchOrder) {
              await fetchOrder();
            }
          }
          return false;
        };

        // Start polling after a short delay to allow webhook to process
        pollTimeoutId = setTimeout(pollForOrder, 1000);
      } else if (isMounted) {
        // For COD or if no session_id, just fetch orders
        if (fetchOrder) {
          fetchOrder();
        }
        if (fetchCartItems) {
          fetchCartItems();
        }
      }
    };

    verifyAndFetchOrders();

    // Cleanup function
    return () => {
      isMounted = false;
      if (pollTimeoutId) {
        clearTimeout(pollTimeoutId);
      }
    };
  }, [sessionId]); // Only depend on sessionId

  return (
    <div className='mx-auto flex flex-col items-center justify-center gap-4 rounded m-2 py-5 w-full max-w-sm bg-green-300 p-4'>
      {isVerifying ? (
        <p className='text-green-800 font-medium text-lg text-center'>
          Verifying your order...
        </p>
      ) : (
        <p className='text-green-800 font-medium text-lg text-center'>{message}</p>
      )}
      <Link
        to="/"
        className='text-center border-2 cursor-pointer hover:bg-green-900 hover:text-white transition-colors hover:border-green-500 border-green-900 px-4 py-1'
      >
        Go To Home
      </Link>
    </div>
  );
};

export default Success;
