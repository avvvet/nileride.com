import React, { Component } from 'react';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Table} from 'semantic-ui-react';
import $ from 'jquery';

class Trafics extends Component {
    constructor() {
        super();
        this.state = {
            trafic_data : []
        }
    }

    componentDidMount(){
        this.getTrafics();
    }

    createGrid = (trafics_data) => { 
        const row = trafics_data.map((trafic) =>
            <Table.Row>
                <Table.Cell>{trafic.date}</Table.Cell>
                <Table.Cell>{trafic.trafic_type}</Table.Cell>
                <Table.Cell>{trafic.trafic_count}</Table.Cell>
            </Table.Row>
        );
        return row;
    }

    getTrafics = () => {
        $.ajax({ 
            type:"GET",
            url:"/admin/get_trafic",
            contentType: "application/json",
            success: function(trafic, textStatus, jqXHR) {
              this.setState({
                  trafic_data : trafic
              })
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    render() {  
      return (
        <div>
              <Table celled striped>
                <Table.Header>
                    <Table.Row>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Trafic Type</Table.HeaderCell>
                    <Table.HeaderCell>Count</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                {this.createGrid(this.state.trafic_data)}
                </Table.Body>
             </Table>
        </div>
      )
    }
}
export default Trafics;