// 9)  Implement a scoreboard.  

// This would keep a record of who has the most points or wins 
// (or whatever your metric for scoring is). 
// If you implement your game as a P2P games, you should use your 
// bootstrap server as scoreboard server (a distributed scoreboard 
// would be great, but it is beyond the scope of the course, so unless 
// you're really motivated to do so, you can take the more centralized 
// and simpler approach).  The scoreboard should be persistent across 
// all games (you can back it up to a file regularly on the server so 
// if your server crashes, it can automatically reload it from the disk 
// the next time it restarts).