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
      body: body,
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
  email_box.classList.add("row");
  if (email.read) {
    email_box.id = "email_box_unreaded";
  } else {
    email_box.id = "email_box_readed";
  }

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
  subject.classList.add("col-5");
  subject.innerHTML = email.subject;
  email_box.append(subject);

  const timestamp = document.createElement('div');
  timestamp.id = "timestamp_box";
  timestamp.classList.add("col-3");
  timestamp.innerHTML = email.timestamp;
  email_box.append(timestamp);

  if (mailbox !== "sent") {
    const archive_button = document.createElement('img');
    archive_button.id = "archive_button";
    archive_button.src = "static/mail/archive.jpg";
    archive_button.classList.add("col-1");
    email_box.append(archive_button);
    archive_button.addEventListener("click", () => change_email_archive(email.id, email.archived));

  }

  document.querySelector('#emails-view').append(email_box);
  recipient.addEventListener('click', () => view_email(email));
  subject.addEventListener('click', () => view_email(email));
  timestamp.addEventListener('click', () => view_email(email));


}

function view_email(email) {
    
  console.clear();
  document.querySelector('#view-email').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').innerHTML = '';
  
  change_to_read(email.id);

  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);

    const email_view = document.createElement('div');
    email_view.id = "email_view";
    const email_info = document.createElement('div');
    email_info.id = "email_info";
    email_view.append(email_info);

    const email_sender = document.createElement('h5');
    email_sender.innerHTML = `From: ${email.sender}`;
    
    const email_recipient = document.createElement('h5');
    email_recipient.innerHTML = `To: ${email.recipients}`;
   
    const email_subject = document.createElement('h5');
    email_subject.innerHTML = `Subject: ${email.subject}`;
    
    const email_timestamp = document.createElement('h5');
    email_timestamp.innerHTML = `Timestamp: ${email.timestamp}`;

    const reply = document.createElement('button');
    reply.id = 'reply';
    reply.className = ("btn btn-sm btn-outline-primary");
    reply.innerHTML = "Reply";
    reply.addEventListener('click', () => reply_email(email));
    

    const hr = document.createElement('hr');

    email_info.append(email_sender, email_recipient, email_subject, email_timestamp, reply, hr);

    const email_body = document.createElement('div');
    email_body.id = 'email_body';
    email_body.innerHTML = email.body;

    document.querySelector('#view-email').append(email_view, email_body);
    
  })
  
  return false;
  

}


function change_email_archive(email_id, old_value) {
  const new_value = !old_value;
  fetch(`/emails/${email_id}`, {
    method : "PUT",
    body: JSON.stringify ({
      archived : new_value
    })
  })
  load_mailbox('inbox');
  window.location.reload();
}

function change_to_read(email_id) {
  fetch(`/emails/${email_id}`, {
    method : "PUT",
    body: JSON.stringify ({
      read: true
    })
  })
  return false;
}

function reply_email(email) {
  compose_email()
  document.querySelector('#compose-recipients').value = email.recipients;
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `"On ${email.timestamp, email.sender} wrote:" ${email.body}`;

}