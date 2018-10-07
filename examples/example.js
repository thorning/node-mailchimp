var Mailchimp = require('../index.js');

var api_key = '...'
var example_list_id = '...';

var mailchimp = new Mailchimp(api_key);

var callback = function (err, result) {
  if (err) {
    console.log('error', err);
  }
  console.log(result);
  process.exit(0);
}
// *********************************************
// check status mailchimp server / root
var status = {
  method : 'get',
  path : '/',
}
mailchimp.request(status, callback)

// *********************************************
// get all list contact
var get_lists = {
  method : 'get',
  path : '/lists',
}
mailchimp.request(get_lists, callback)

// *********************************************
// // get a list by list id
var get_list_info = {
  method : 'get',
  path : '/lists/' + example_list_id
}
mailchimp.request(get_list_info, callback)

// *********************************************
// // get list info with path params
var get_list_info_path_params = {
  method : 'get',
  path : '/lists/{list_id}',
  path_params : {
    list_id : example_list_id
  }
}
mailchimp.request(get_list_info_path_params, callback)

// *********************************************
// add a new member to the list
var add_new_member = {
  method: 'post',
  path: `/lists/${example_list_id}/members`,
  body: {
    email_address: 'example@gmail.com',
    status: 'subscribed'
  }
}
mailchimp.request(add_new_member, callback)

