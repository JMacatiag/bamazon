var mysql = require('mysql');
var Table = require('cli-table');
var inquirer = require("inquirer");

// connect to bamazon database
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "bamazon"
});

var desiredId;
var desiredQuantity;
var quantity;
var price;

// show products table
function showProduct(){
	// table display
	var table = new Table({
		//table headers
	    head: ['Item ID', 'Item Name', 'Department', 'Price', 'Quantity']
	});
 	// access products from database
	con.query("SELECT * FROM products", function(err, res) {
	    for (var i = 0; i < res.length; i++) {
	    	// push values from product table to CLI table
	    	table.push(
	        	[res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
	      );
    }
    // show products to user
    console.log(table.toString());
    // run function to ask user for product ID
    askUserForId();
  })
}

// function to ask user for desired product ID
function askUserForId(){
	// prompt to get user input
	inquirer.prompt([{
		type: 'text',
		message: 'Enter the desired product ID',
		name: 'productId',

		}]).then(function(inquirerResponse){
				// save user's product choice
				desiredId = parseInt(inquirerResponse.productId); 
				// run function to get quantity of product from user
				askUserQuantity();
			}
  );
}

// function to ask user how many of the product they wish to purchase
function askUserQuantity(){
	// prompt to get user input for amount to purchase
 	inquirer.prompt([{
		type: 'text',
		message: 'How many would you like to buy?',
		name: 'quantityOfOrder',

		}]).then(function(inquirerResponse){
				// save user input of amount to purchase
				desiredQuantity = parseInt(inquirerResponse.quantityOfOrder);
				// run function to determine total price and update bamazon database
				runBamazon();
			}
 	);
 }

// function to dispay total price and update bamazon database
function runBamazon(){
	// access products table and get product that corresponds to the appropriate product ID
 	con.query("SELECT * FROM products WHERE item_id ="+desiredId, function(err, res) {
 		// save stock quantity of desired product
 		quantity=res[0].stock_quantity;
 		// save price of desired product
 		price=res[0].price;
 		// if the desired quantity is less than the available stock then run the update table function
 		if(desiredQuantity<quantity){
 			updateTable();
 		}
 		// if desired quantity is more than available stock, notify user and end process
 		else{
 			console.log('Not Enough Stock!');
 			process.exit();
 		}
    });
 }

// function to update the database
function updateTable(){
	// new value of the available stock after user purchase is deducted
 	var value=quantity-desiredQuantity;
 	// access database to update
 	var query = con.query(
 		// update product table: stock_quantity to value at item_Id
	    "UPDATE products SET ? WHERE ?",
	    [
	      {
	        stock_quantity: value
	      },
	      {
	        item_id: desiredId
	      }
	    ],
	    function(err, res) {
	    	// total price of user purchase saved to the hundredths decimal place
	    	var total=(price*desiredQuantity).toFixed(2);
	    	// display price of user purchase
	    	console.log('Your total is $'+total);
	    	// exit process
	    	process.exit();
	    }
	);
}

// run program
showProduct();






