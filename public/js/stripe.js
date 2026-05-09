/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51TUxpvD3qHoWXGiGsa9wgW4qjLsF4TacydvFSe8wIVmMtjl1sYQoxSivPkK7o7mb3vhsu2rceY121Xf6vfTQ6liq0058ND2TWP');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/app/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
