import React from 'react';
import { Panel } from 'react-bootstrap';

import ProductTable from './ProductTable.jsx';
import ProductAdd from './ProductAdd.jsx';
import graphQLFetch from './graphQLFetch.js';
import withToast from './withToast.jsx';

class ProductList extends React.Component {
  constructor() {
    super();
    this.state = {
      products: [],
    };
    this.createProduct = this.createProduct.bind(this);
    this.deleteProduct = this.deleteProduct.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const { showError } = this.props;
    const vars = {};
    let query = `query {
      productList {
        id category name price image
      }
      productsCount
    }`;

    let result = await graphQLFetch(query, vars, showError);
    this.setState({ products: result.productList, productsCount: result.productsCount });
  }

  async createProduct(newProduct) {
    const query = `mutation productAdd($newProduct: ProductInputs!) {
      productAdd(product: $newProduct) {
        id
      }
    }`;
    const { showError } = this.props;
    const response = await graphQLFetch(query, { newProduct }, showError);
    if (response) {
      this.loadData();
    }
  }

  async deleteProduct(index) {
    const query = `mutation productDelete($id: Int!) {
      productDelete(id: $id)
    }`;
    const { products } = this.state;
    const { showSuccess, showError } = this.props;
    const { id } = products[index];
    const data = await graphQLFetch(query, { id }, showError);
    console.log(data); // eslint-disable-line no-console
    if (data && data.productDelete) {
      this.setState((prevState) => {
        const newList = [...prevState.products];
        newList.splice(index, 1);
        return { products: newList };
      });
      this.showSuccess(`Deleted product ${id} successfully.`);
    } else {
      this.loadData();
    }
  }

  render() {
    const { products, productsCount } = this.state;
    return (
      <div>
        <Panel>
          <Panel.Heading>
            <Panel.Title>{`Showing all available ${productsCount} products`}</Panel.Title>
          </Panel.Heading>
          <Panel.Body>
            <ProductTable
              products={products}
              deleteProduct={this.deleteProduct}
            />
          </Panel.Body>
        </Panel>
        <h2>Add a new product to inventory</h2>
        <ProductAdd createProduct={this.createProduct} />
      </div>
    );
  }
}

const ProductListWithToast = withToast(ProductList);
export default ProductListWithToast;
