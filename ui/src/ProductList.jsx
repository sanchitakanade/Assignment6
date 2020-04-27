/* Name: Sanchita Kanade
   Class:CS648.02 Modern Full-Stack Web Development (Spring 2020)
   Assignment: 6
   File: ProductList.jsx
*/

import React from 'react';
import graphQLFetch from './graphQLFetch.js';
import ProductTable from './ProductTable.jsx';
import ProductAdd from './ProductAdd.jsx'; 
import Toast from './Toast.jsx';

export default class ProductList extends React.Component {
  constructor() {
    super();
    this.state = {
      products: [],
      toastVisible: false,
      toastMessage: ' ',
      toastType: 'info',
    };
    this.list();
    this.createProduct = this.createProduct.bind(this); 
    this.deleteProduct = this.deleteProduct.bind(this);

    this.showSuccess = this.showSuccess.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
  }

  componentDidMount() {
    this.list();
    document.forms.productAdd.Price.value = '$';
  }

  async createProduct(product) {
    const query = `mutation addProduct($product: productInputs!) {
    addProduct(product: $product) {
        id
    }
    }`;
    const data = await graphQLFetch(query, { product }, this.showError);
    if (data) {
      this.list();
    }
  }

  async list() {
    const query = `query {
    productList {
        id Category Name Price
        Image
    }
    }`;
    const data = await graphQLFetch(query, {}, this.showError);
    if (data) {
      this.setState({ products: data.productList });
    }
  }

  async deleteProduct(index) {
    const query = `mutation deleteProduct($id: Int!) {
      deleteProduct(id: $id)
    }`;
    const { products } = this.state;
    const { location: { pathname, search }, history } = this.props;
    const { id } = products[index];
    const data = await graphQLFetch(query, { id }, this.showError);
    if (data && data.deleteProduct) {
      this.showSuccess(`Deleted product ${id} successfully.`);
      this.setState((prevState) => {
        const newList = [...prevState.products];
        if (pathname === `/products/${id}`) {
          history.push({ pathname: '/products', search });
        }
        newList.splice(index, 1);
        return { products: newList };
      });
    } else {
      this.list();
    }
  }

  showSuccess(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'success',
    });
  }

  showError(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'danger',
    });
  }

  dismissToast() {
    this.setState({ toastVisible: false });
  }

  render() {
    const { products } = this.state;
    const { toastVisible, toastType, toastMessage } = this.state;

    return (
      <React.Fragment>
        <h4>Showing all available products</h4>
        <hr />
        <ProductTable products={products} deleteProduct={this.deleteProduct} />
        <ProductAdd createProduct={this.createProduct} />
        <Toast
          showing={toastVisible}
          onDismiss={this.dismissToast}
          bsStyle={toastType}
        >
          {toastMessage}
        </Toast>
      </React.Fragment>
    );
  }
}
