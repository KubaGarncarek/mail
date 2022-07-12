document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = send_email;
}   

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    emails.forEach(email => show_emails(email,mailbox));
    
  })
}

function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify ({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result); 
  });
  localStorage.clear();
  load_mailbox('sent');
  return false;
}

function show_emails(email, mailbox) {
  const email_box = document.createElement('div');
  email_box.id = "email_box";
  email_box.classList.add("row");

  const recipient = document.createElement('div');
  recipient.id = "recipient_box";
  recipient.classList.add("col-3");
  console.log(mailbox);
  if (mailbox === "inbox") {
    recipient.innerHTML = email.sender;
  } else {
    recipient.innerHTML = email.recipients[0];
  }
  email_box.append(recipient);

  const subject = document.createElement('div');
  subject.id = "subject_box";
  subject.classList.add("col-6");
  subject.innerHTML = email.subject;
  email_box.append(subject);

  const timestamp = document.createElement('div');
  timestamp.id = "timestamp_box";
  timestamp.classList.add("col-3");
  timestamp.innerHTML = email.timestamp;
  email_box.append(timestamp);

  document.querySelector('#emails-view').append(email_box);
  email_box.addEventListener('click', () => view_email(email))
}

function view_email(email) {
  document.querySelector('#view-email').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';

  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);

  })
  const email_view = document.createElement('div');
  email_view.id = "email_view"
  email_view.innerHTML = `From: ${email.sender}`;
  document.querySelector('#view-email').append(email_view);
}