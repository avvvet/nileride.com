import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
   super();
   this.state = {
     list: []
   }
  }
  
  componentDidMount(){
    this.getList();
  }

   // Retrieves the list of items from the Express app
   getList = () => {
    fetch('/api/getList')
    .then(res => res.json())
    .then(list => this.setState({ list }))
  }

  render() {
    return (
      <div>
        {this.state.list}
      </div>
    );
  }
}

export default App;