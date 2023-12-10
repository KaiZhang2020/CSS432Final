import java.util.ArrayList;
import java.util.List;

/**
 * The GameRoom class represents a room in a game server.
 * It can be either available or occupied by players.
 */
public class GameRoom {
    private String displayName;
    private List<PlayerConnection> players;
    private boolean isBusy;

    /**
     * Constructs a GameRoom with a specified display name.
     * Initially, the room is not busy and has no players.
     *
     * @param displayName The display name for the game room.
     */
    public GameRoom(String displayName) {
        this.displayName = displayName;
        this.players = new ArrayList<>();
        this.isBusy = false;
    }

    /**
     * Adds a player to the room and marks it as busy.
     *
     * @param player The PlayerConnection to add to the room.
     */
    public void addPlayer(PlayerConnection player) {
        players.add(player);
        if(players.size() == 2){
            player.setIngame(true);
            updateBusy();
            startgame();
        }else if(players.size() < 2){
            player.setIngame(true);
            updateBusy();
            player.writeMessage("Waiting for another player");
        }else{ // room full
            player.writeMessage(displayName + " full");
        }
    }

    private void endGame(){
        for (PlayerConnection player : players) {
            players.remove(player);
            player.setIngame(false);
        }
        //players.clear();
        updateBusy();
    }

    /**
     * Updates the busy status of the room.
     *
     * @return true if the room is busy, false otherwise.
     */
    private boolean updateBusy() {
        if (players.size() >= 2) {
            isBusy = true;
        } else {
            isBusy = false;
        }
        return isBusy;
    }

    /**
     * Checks if the room is busy.
     *
     * @return true if the room is busy, false otherwise.
     */
    public boolean isBusy() {
        return isBusy;
    }

    /**
     * Gets the display name of the room.
     *
     * @return The display name of the room.
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Starts the game. This method is called when the room is full.
     * It will loop until the game is over.
     */
    private boolean startgame(){
        String playerOneChoice = null;
        String playerTwoChoice = null;

        PlayerConnection playerOne = players.get(0);
        PlayerConnection playerTwo = players.get(1);
        
        playerOne.writeMessage("r = rock, p = paper, s = scissor");
        playerTwo.writeMessage("r = rock, p = paper, s = scissor");

        while(playerOneChoice == null){
            playerOneChoice = players.get(0).readMessage();
        }

        while(playerTwoChoice == null){
            playerTwoChoice = players.get(1).readMessage();
        }

        // Game logic for rock paper scissors
        if(playerOneChoice.equals("r") && playerTwoChoice.equals("s")){
            playerOne.writeMessage("You win!");
            playerTwo.writeMessage("You lose!");
            playerOne.incrementScore();
        } else if(playerOneChoice.equals("r") && playerTwoChoice.equals("p")){
            playerOne.writeMessage("You lose!");
            playerTwo.writeMessage("You win!");
            playerTwo.incrementScore();
        } else if(playerOneChoice.equals("s") && playerTwoChoice.equals("r")){
            playerOne.writeMessage("You lose!");
            playerTwo.writeMessage("You win!");
            playerTwo.incrementScore();
        } else if(playerOneChoice.equals("s") && playerTwoChoice.equals("p")){
            playerOne.writeMessage("You win!");
            playerTwo.writeMessage("You lose!");
            playerOne.incrementScore();
        } else if(playerOneChoice.equals("p") && playerTwoChoice.equals("r")){
            playerOne.writeMessage("You win!");
            playerTwo.writeMessage("You lose!");
            playerOne.incrementScore();
        } else if(playerOneChoice.equals("p") && playerTwoChoice.equals("s")){
            playerOne.writeMessage("You lose!");
            playerTwo.writeMessage("You win!");
            playerTwo.incrementScore();
        } else if (playerOneChoice.equals(playerTwoChoice)) {
            playerOne.writeMessage("Draw!");
            playerTwo.writeMessage("Draw!");
        } else { // Chat
            playerOne.writeMessage(playerTwo.getName() + ": " + playerTwoChoice);
            playerTwo.writeMessage(playerOne.getName() + ": " + playerOneChoice);
            return true;
        }
        
        endGame();
        return false;
    }

}
