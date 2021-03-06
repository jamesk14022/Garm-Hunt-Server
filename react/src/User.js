import React, {Component} from 'react';
import ItemGrid from './ItemGrid';
import Client from './Client';

class User extends Component{
	constructor(props){
		super(props);
		this.state = {userid: '', fullname: ''}
		this.getNameFromId = this.getNameFromId.bind(this)
	}

	componentDidMount(){
		this.setState({userid: this.props.match.params.userid});
		this.getNameFromId();
	}

	getNameFromId(){
		Client.getUserById(this.props.match.params.userid)
			.then((response) => response.json())
			.then((body) => {
				this.setState({ fullname: body[0].full_name })
			});
	}

	render(){
		let { userid, fullname } = this.state;
		return(
		<div className="User">
			<div className="container">
				<div className="container">
				<h2 style={{ 'marginTop': '80px'}}> {fullname} - submissions </h2>
				<hr />
				</div>
				<ItemGrid user={userid} />
			</div>
		</div>
		)
	}
}

export default User;