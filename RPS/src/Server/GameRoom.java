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
        if(players.size() == 2){
            players.add(player);
            player.setIngame(true);
            updateBusy();
            startgame();
        }else if(players.size() < 2){
            players.add(player);
            player.setIngame(true);
            updateBusy();
            player.writeMessage("Waiting for another player");
        }else{ // room full
            player.writeMessage("Room " + displayName +" full");
        }
    }

    public void endGame(){
        for(PlayerConnection player : players){
            players.remove(player);
            player.setIngame(false);
        }
        players.clear();
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

    // Additional methods as needed
    /**
     * start game
     */
    private void startgame(){
        String playerOneChoice = null;
        String playerTwoChoice = null;
        
        players.get(0).writeMessage("r = rock, p = paper, s = scissor");
        players.get(1).writeMessage("r = rock, p = paper, s = scissor");

        while(playerOneChoice == null){
            playerOneChoice = players.get(0).readMessage();
        }

        while(playerTwoChoice == null){
            playerTwoChoice = players.get(1).readMessage();
        }

        // Game logic for rock paper scissors
        if(playerOneChoice.equals("r") && playerTwoChoice.equals("s")){
            players.get(0).writeMessage("You win!");
            players.get(1).writeMessage("You lose!");
            players.get(0).incrementScore();
        }else if(playerOneChoice.equals("r") && playerTwoChoice.equals("p")){
            players.get(0).writeMessage("You lose!");
            players.get(1).writeMessage("You win!");
            players.get(1).incrementScore();
        }else if(playerOneChoice.equals("s") && playerTwoChoice.equals("r")){
            players.get(0).writeMessage("You lose!");
            players.get(1).writeMessage("You win!");
            players.get(1).incrementScore();
        }else if(playerOneChoice.equals("s") && playerTwoChoice.equals("p")){
            players.get(0).writeMessage("You win!");
            players.get(1).writeMessage("You lose!");
            players.get(0).incrementScore();
        }else if(playerOneChoice.equals("p") && playerTwoChoice.equals("r")){
            players.get(0).writeMessage("You win!");
            players.get(1).writeMessage("You lose!");
            players.get(0).incrementScore();
        }else if(playerOneChoice.equals("p") && playerTwoChoice.equals("s")){
            players.get(0).writeMessage("You lose!");
            players.get(1).writeMessage("You win!");
            players.get(1).incrementScore();
        }else{
            players.get(0).writeMessage("Draw!");
            players.get(1).writeMessage("Draw!");
        }
        
        endGame();
    }

}
