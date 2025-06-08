// Connect to Socket.IO server
const socket = io('http://localhost:3000');

// DOM Elements
const pollForm = document.getElementById('pollForm');
const questionInput = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const pollsContainer = document.getElementById('pollsContainer');
const addOptionBtn = document.getElementById('addOption');
const createPollBtn = document.getElementById('createPoll');
const notificationContainer = document.getElementById('notification');
const durationInput = document.getElementById('duration');
const isPrivateCheckbox = document.getElementById('isPrivate');
const allowMultipleVotesCheckbox = document.getElementById('allowMultipleVotes');

// Poll creation settings
const pollSettings = {
    duration: 0,
    isPrivate: false,
    allowMultipleVotes: false
};

// Update poll settings when inputs change
durationInput.addEventListener('change', (e) => {
    pollSettings.duration = parseInt(e.target.value) || 0;
});

isPrivateCheckbox.addEventListener('change', (e) => {
    pollSettings.isPrivate = e.target.checked;
});

allowMultipleVotesCheckbox.addEventListener('change', (e) => {
    pollSettings.allowMultipleVotes = e.target.checked;
});

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add new option input
function addOptionInput() {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-input';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter option';
    input.required = true;
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-option';
    removeBtn.onclick = () => {
        if (optionsContainer.children.length > 2) {
            optionDiv.remove();
        } else {
            showNotification('Poll must have at least 2 options', 'error');
        }
    };
    
    optionDiv.appendChild(input);
    optionDiv.appendChild(removeBtn);
    optionsContainer.appendChild(optionDiv);
}

// Initialize with two options
addOptionInput();
addOptionInput();

// Add option button click handler
addOptionBtn.addEventListener('click', () => {
    const currentOptions = Array.from(optionsContainer.querySelectorAll('input'))
        .map(input => input.value.trim());
    
    if (currentOptions.length >= 10) {
        showNotification('Maximum 10 options allowed', 'error');
        return;
    }
    
    addOptionInput();
});

// Create poll button click handler
createPollBtn.addEventListener('click', () => {
    const question = questionInput.value.trim();
    const options = Array.from(optionsContainer.querySelectorAll('input'))
        .map(input => input.value.trim())
        .filter(option => option !== '');
    
    if (!question) {
        showNotification('Please enter a question', 'error');
        return;
    }
    
    if (options.length < 2) {
        showNotification('Please add at least 2 options', 'error');
        return;
    }
    
    if (new Set(options).size !== options.length) {
        showNotification('Duplicate options are not allowed', 'error');
        return;
    }
    
    const poll = {
        question,
        options: options.map(text => ({ text })),
        duration: pollSettings.duration,
        isPrivate: pollSettings.isPrivate,
        allowMultipleVotes: pollSettings.allowMultipleVotes
    };
    
    socket.emit('createPoll', poll);
    
    // Reset form
    questionInput.value = '';
    optionsContainer.innerHTML = '';
    addOptionInput();
    addOptionInput();
    durationInput.value = '0';
    isPrivateCheckbox.checked = false;
    allowMultipleVotesCheckbox.checked = false;
    pollSettings.duration = 0;
    pollSettings.isPrivate = false;
    pollSettings.allowMultipleVotes = false;
});

// Render a single poll
function renderPoll(poll) {
    const pollElement = document.createElement('div');
    pollElement.className = 'poll';
    pollElement.dataset.pollId = poll.id;
    
    const questionElement = document.createElement('h3');
    questionElement.textContent = poll.question;
    pollElement.appendChild(questionElement);
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options';
    
    poll.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = `${option.percentage}%`;
        
        const optionContent = document.createElement('div');
        optionContent.className = 'option-content';
        
        const optionText = document.createElement('span');
        optionText.textContent = option.text;
        
        const voteCount = document.createElement('span');
        voteCount.className = 'vote-count';
        voteCount.textContent = `${option.votes} votes (${option.percentage}%)`;
        
        optionContent.appendChild(optionText);
        optionContent.appendChild(voteCount);
        
        optionElement.appendChild(progressBar);
        optionElement.appendChild(optionContent);
        
        optionElement.addEventListener('click', () => {
            socket.emit('vote', { pollId: poll.id, optionIndex: index });
        });
        
        optionsContainer.appendChild(optionElement);
    });
    
    pollElement.appendChild(optionsContainer);
    
    const footer = document.createElement('div');
    footer.className = 'poll-footer';
    
    const totalVotes = document.createElement('span');
    totalVotes.textContent = `Total votes: ${poll.totalVotes}`;
    
    const timestamp = document.createElement('span');
    timestamp.textContent = new Date(poll.createdAt).toLocaleString();
    
    footer.appendChild(totalVotes);
    footer.appendChild(timestamp);
    
    if (poll.expiresAt) {
        const expiresAt = document.createElement('span');
        expiresAt.textContent = `Expires: ${new Date(poll.expiresAt).toLocaleString()}`;
        footer.appendChild(expiresAt);
    }
    
    if (poll.createdBy === socket.id) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-poll';
        deleteBtn.onclick = () => {
            if (confirm('Are you sure you want to delete this poll?')) {
                socket.emit('deletePoll', { pollId: poll.id });
            }
        };
        footer.appendChild(deleteBtn);
    }
    
    pollElement.appendChild(footer);
    
    return pollElement;
}

// Update polls display
function updatePolls(polls) {
    pollsContainer.innerHTML = '';
    if (polls.length === 0) {
        const noPollsMessage = document.createElement('p');
        noPollsMessage.textContent = 'No active polls. Create one!';
        noPollsMessage.className = 'no-polls';
        pollsContainer.appendChild(noPollsMessage);
    } else {
        polls.forEach(poll => {
            const pollElement = renderPoll(poll);
            pollsContainer.appendChild(pollElement);
        });
    }
}

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to server');
    showNotification('Connected to server', 'success');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    showNotification('Disconnected from server', 'error');
});

socket.on('existingPolls', (polls) => {
    console.log('Received existing polls:', polls);
    updatePolls(polls);
});

socket.on('pollCreated', (poll) => {
    console.log('Poll created:', poll);
    showNotification('Poll created successfully!', 'success');
    const existingPoll = document.querySelector(`[data-poll-id="${poll.id}"]`);
    if (existingPoll) {
        existingPoll.replaceWith(renderPoll(poll));
    } else {
        pollsContainer.insertBefore(renderPoll(poll), pollsContainer.firstChild);
    }
});

socket.on('voteUpdate', (poll) => {
    console.log('Vote update:', poll);
    const pollElement = document.querySelector(`[data-poll-id="${poll.id}"]`);
    if (pollElement) {
        pollElement.replaceWith(renderPoll(poll));
    }
});

socket.on('pollDeleted', (pollId) => {
    console.log('Poll deleted:', pollId);
    const pollElement = document.querySelector(`[data-poll-id="${pollId}"]`);
    if (pollElement) {
        pollElement.remove();
        showNotification('Poll deleted successfully', 'success');
    }
});

socket.on('pollsUpdate', (polls) => {
    console.log('Polls update:', polls);
    updatePolls(polls);
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
    showNotification(error.message, 'error');
}); 
