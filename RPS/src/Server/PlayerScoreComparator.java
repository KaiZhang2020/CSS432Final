import java.util.Comparator;

public class PlayerScoreComparator implements Comparator<PlayerConnection> {
    @Override
    public int compare(PlayerConnection p1, PlayerConnection p2) {
        // Sorting players by descending score
        return Integer.compare(p2.getScore(), p1.getScore());
    }
}
