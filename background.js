// Number of subreddit posts to fetch and requests to send
const posts = 40;
const maxPosts = 40;
const requests = maxPosts / posts;

const results = [];

// Get the subreddit submitted by user; call getPosts
const getSubreddit = e => {
  e.preventDefault();
  const subreddit = document.getElementById('subreddit').value;
  getPosts(subreddit);
};

const getPosts = async (subreddit, afterParam) => {
  
  // Fetch posts from subreddit, specifying the number of posts to retrieve
  const result = await fetch(
    `https://www.reddit.com/r/${subreddit}.json?limit=${posts}${
      afterParam ? '&after=' + afterParam : ''
    }`
  );

  // Convert to JSON and push into results array 
  const resultJSON = await result.json();
  results.push(resultJSON);

  // If not enough posts have been retrieved, recall getPosts and include the 'after' parameter
  if (resultJSON.data.after && results.length < requests) {
    getPosts(subreddit, resultJSON.data.after);
    return;
  }
  convertResults(results);
};

var convertResults = function convertResults(results) {

  const allPosts = [];
  const ids = [];

  // Convert the results array from an array of objects (which are also arrays) to one array with all posts retreived
  results.forEach(result => {
    allPosts.push(...result.data.children);
  });

  // From allPosts, take the id of each post and put it into the ids array
  allPosts.forEach(({data: {subreddit, id}}) => {
    
    ids.push(id);
  });

  getComments(ids);

};

var getComments = async function getComments(ids) {

  const topComments = [];
  var length = ids.length;
  const subreddit = document.getElementById('subreddit').value;

  // Loop through the ids array and retrieve the top comment for each post 
  for (let i = 0; i < length; i++) {
    const comment = await fetch(`https://www.reddit.com/r/${subreddit}/comments/${ids[i]}.json?sort=top&depth=1&limit=1`);
    const commentJSON = await comment.json();
    topComments.push(commentJSON);
  };

  // Use the map function to create a new array taking only the part we need from topComments 
  var topCommentsMap = topComments.map(function(x) { 
    return { 
      lng: x[1]
    }; 
  });

  getResults(topCommentsMap);
};


  var getResults = function getResults(topCommentsMap) {

    commentData = {};
    
    for (let i = 0; i < topCommentsMap.length; i++) {
      // Ensure that the comment is not undefined and the array at topCommentsMap[i] is not empty
      if (topCommentsMap[i].lng.data.children.length > 0 && typeof(topCommentsMap[i].lng.data.children[0].data.body) != 'undefined') {
        // Insert the properties we want into the object commentData for each post, organized by index 'i' 
        commentData[i] = {
          body: topCommentsMap[i].lng.data.children[0].data.body,
          score: topCommentsMap[i].lng.data.children[0].data.score,
          author: topCommentsMap[i].lng.data.children[0].data.author,
          depth: topCommentsMap[i].lng.data.children[0].data.depth,
          permalink: topCommentsMap[i].lng.data.children[0].data.permalink
        };
      };
 
    };

      // Convert the object into an array
      const commentsList = Object.keys(commentData).map(i => ({
        i,
        body: commentData[i].body,
        score: commentData[i].score,
        author: commentData[i].author,
        depth: commentData[i].depth,
        permalink: commentData[i].permalink
      }) );

      // Create a new array that is commentsList sorted by the score of each comment, descending in value
      const sortedList = commentsList.sort((commentA, commentB) => commentB.score - commentA.score);
    
      displayResults(sortedList);
    };

const displayResults = sortedList => {

  // Select the container in which we'll put the results
  const container = document.getElementById('results-container');
 
  sortedList.forEach(({ body, score, author, permalink }) => {
  
    //For each object in the sortedList, create a new anchor tag element to insert the information into
    const resultCard = document.createElement('a');
    // Create the href for each anchor tag element
    resultCard.href = "https://www.reddit.com/" + permalink;
    // Give resultCard a class name
    resultCard.classList.add('result-card');
    // Add text to each result card using an interpolated string
    resultCard.innerText = 
    `${body} 
    
    ${author} - ${score} point(s)`;

    // Add to container
    container.appendChild(resultCard);
  });
  
};

// Get the select form from popup.html
const subredditForm = document.getElementById('subreddit-form');

// Add event listener on submit button 
if (subredditForm) {
  subredditForm.addEventListener('submit', getSubreddit);
}


