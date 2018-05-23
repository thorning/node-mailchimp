import MailChimp from '../';

const apiKey = '...'
const client = new MailChimp(apiKey);
client.get('path').then(console.log);