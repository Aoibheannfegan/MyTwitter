
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded')
    const likeButtons = document.querySelectorAll('.likeBtn');
    likeButtons.forEach(button => {
        button.addEventListener('click', likedPost);
    });
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', addActiveStatus)
        console.log('nav click click listener added')
    })

    const editButtons = document.querySelectorAll('.editBtn');
    editButtons.forEach(button => {
        button.addEventListener('click', editPost);
    });

    const btn = document.getElementById('followBtn');
    btn.addEventListener('click', toggleFollow);
});

function addActiveStatus(event) {
    console.log('addActiveStatus function running');
    const links = document.querySelectorAll('.nav-link');
 
    const isActive = event.target.classList.contains('active');

    if (!isActive) {
        links.forEach((link) => {
            link.classList.remove('active');
        });
        event.target.classList.add('active');
        console.log(`Active class added to ${event.target.innerHTML}`)
    }
}


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
    console.log("likedPost function called and note changed");

    const btn = event.currentTarget;
    const postId = btn.getAttribute('data-post-id');
    
    // Check if it's the like or unlike button
    const action = btn.getAttribute('data-action');
    
    console.log("action:", action);

    const headers = getFetchHeaders();

    const likeBtnSvg = document.getElementById(`like-heart-${postId}`)
    const likeBtnPath = document.getElementById(`like-btn-path-${postId}`)
    const unlikePath = 'm8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15'
    const likePath = 'M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314'

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
            console.log('data fetch successful!')
            const likedCountElem = document.getElementById(`likes-count-${postId}`);
            console.log(`Likes = ${data.Likes}`)
            if(data.Likes === 1){
                likedCountElem.textContent = `${data.Likes} like`;
            } else {
                likedCountElem.textContent = `${data.Likes} likes`;
            }

            // update button class based on action
            if (action === 'like') {
                console.log(`like button clicked and svg is: ${likeBtnSvg.id}`)
                btn.setAttribute('data-action', 'unlike');
                likeBtnSvg.classList.remove('bi', 'bi-heart');
                likeBtnSvg.classList.add('bi', 'bi-heart-fill');
                likeBtnPath.setAttribute('d', likePath);
            } else {
                console.log(`unlike btn clicked and svg is: ${likeBtnSvg.id}`)
                btn.setAttribute('data-action', 'like');
                likeBtnSvg.classList.remove('bi', 'bi-heart-fill');
                likeBtnSvg.classList.add('bi', 'bi-heart');
                likeBtnPath.setAttribute('d', unlikePath);
            }

        } else {
            alert('Something went wrong. Please try again later');
        }
    });
}



function editPost(event) {
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
    textarea.className = 'edit-text'
    contentElem.replaceWith(textarea);

    const saveButton = document.createElement('button');
    saveButton.className = 'save-btn'
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

