
document.addEventListener('DOMContentLoaded', function() {
    const likeButtons = document.querySelectorAll('.likeBtn');
    likeButtons.forEach(button => {
        button.addEventListener('click', likedPost);
    });
    
    const editButtons = document.querySelectorAll('.editBtn');
    editButtons.forEach(button => {
        button.addEventListener('click', editPost);
    });

    const btn = document.getElementById('followBtn');
    btn.addEventListener('click', toggleFollow);
});


function getFetchHeaders() {
    const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    return {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
    };
}

function toggleFollow() {
    console.log("toggleFollow function called");

    const btn = document.getElementById('followBtn');
    console.log("btn:", btn);

    const userId = btn.getAttribute('data-user-id');
    console.log("userId:", userId);

    const action = btn.innerHTML === 'Follow' ? 'follow' : 'unfollow';
    console.log("action:", action);

    const headers = getFetchHeaders();

    fetch(`/follow_toggle/${userId}/`, {
        method: 'POST',
        body: JSON.stringify({
            action: action
        }),
        headers: headers
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // toggle button
            btn.innerHTML = action === 'follow' ? 'Unfollow': 'Follow';

            //update follower count
            const followerCountElem = document.getElementById('follower-count');
            followerCountElem.textContent = 'Followers: ' + data.new_follower_count;

        } else {
            alert('Something went wrong. Please try again later')
        }
    });
}



function likedPost(event) {
    console.log("likedPost function called");

    const btn = event.currentTarget;
    const postId = btn.getAttribute('data-post-id');
    
    // Check if it's the like or unlike button
    const action = btn.getAttribute('data-action');
    
    console.log("action:", action);

    const headers = getFetchHeaders();

    fetch(`/like_button/${postId}/`, {
        method: 'POST',
        body: JSON.stringify({
            action: action
        }),
        headers: headers
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // update like count
            const likedCountElem = document.getElementById(`likes-count-${postId}`);
            likedCountElem.textContent = data.Likes;

            // update button class based on action
            if (action === 'like') {
                btn.classList.remove('btn-outline-success');
                btn.classList.add('btn-success');
                btn.setAttribute('data-action', 'unlike'); 
            } else {
                btn.classList.remove('btn-success');
                btn.classList.add('btn-outline-success');
                btn.setAttribute('data-action', 'like'); 
            }

        } else {
            alert('Something went wrong. Please try again later');
        }
    });
}



function editPost() {
    console.log("editButton function called");

    const editBtn = event.currentTarget;
    console.log("Edit btn:", editBtn);

    //get post id
    const postId = editBtn.getAttribute('data-post-id');
    console.log("postId:", postId);

    //get content of current post
    const contentElem = document.querySelector(`.content[data-post-id="${postId}"]`);
    console.log("Content Elem:", contentElem);
    const currentContent = contentElem.textContent;
    console.log("Content:", currentContent);

    //replace content with text area with preloaded content and a save button
    const textarea = document.createElement('textarea');
    textarea.value = currentContent;
    contentElem.replaceWith(textarea);

    const saveButton = document.createElement('button');
    saveButton.className = 'btn btn-info'
    saveButton.id = 'save-button'
    saveButton.textContent = "Save";
    textarea.after(saveButton);

    //run save action when save is clicked
    saveButton.onclick = function() {
        const updatedContent = textarea.value;
        const headers = getFetchHeaders();
        fetch(`/edit/${postId}/`, {
            method: 'POST',
            body: JSON.stringify({
                content: updatedContent
            }),
            headers: headers
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // show updated content
                textarea.replaceWith(contentElem);
                contentElem.textContent = data.Content;
                saveButton.remove();
               

            } else {
                alert('Something went wrong. Please try again later')
            }
        });
    };
}

