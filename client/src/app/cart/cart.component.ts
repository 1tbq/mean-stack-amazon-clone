import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { RestApiService } from '../rest-api.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
//import { async } from 'async';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  btnDisabled = false;
  handler: any;

  quantities = [];

  constructor(
    private data: DataService,
    private rest: RestApiService,
    private router: Router,
  ) { }


  ngOnInit() {
    this.cartItems.forEach(data => {
      this.quantities.push(1);
    });
    this.handler = StripeCheckout.configure({
      key: environment.stripeKey,
      image: 'assets/img/logo.png',
      locale: 'auto',
      token: stripeToken => {
        this.processPayment(stripeToken);
      },
    });
  }

  async processPayment(token: any) {
    let products = [];
    this.cartItems.forEach((product, index) => {
      products.push({
        product: product['_id'],
        quantity: this.quantities[index],
      });
      console.log(products);
    });
    try {
      const data = await this.rest.post(
        'http://localhost:3030/api/payment',
        {
          totalPrice: this.cartTotal,
          products,
          token,
        },
      );
      data['success']
        ? (this.data.clearCart(), this.data.success('Purchase Successful.'))
        : this.data.error(data['message']);
    } catch (error) {
      this.data.error(error['message']);
    }
  }

  checkout() {
    this.btnDisabled = true;
    try {
      if (this.validate()) {
        this.handler.open({
          name: 'Amazono',
          description: 'Checkout Payment',
          amount: this.cartTotal * 100,
          closed: () => {
            this.btnDisabled = false;
          },
        });
      } else {
        this.btnDisabled = false;
      }
    } catch (error) {
      this.data.error(error);
    }
  }

  validate() {
    if (!this.quantities.every(data => data > 0)) {
      this.data.warning('Quantity cannot be less than one.');
    } else if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']).then(() => {
        this.data.warning('You need to login before making a purchase.');
      });
    } else if (!this.data.user['address']) {
      this.router.navigate(['/profile/address']).then(() => {
        this.data.warning('You need to login before making a purchase.');
      });
    } else {
      this.data.message = '';
      return true;
    }
  }


  trackByCartItems(index: number, item: any) {
    return item._id;
  }

  get cartItems() {
    return this.data.getCart();
  }

  get cartTotal() {
    let total = 0;
    this.cartItems.forEach((data, index) => {
      total += data['price'] * this.quantities[index];
    });
    return total;
  }

  removeProduct(index, product) {
    this.quantities.splice(index, 1);
    this.data.removeFromCart(product);
  }
}

