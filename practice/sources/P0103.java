public class P0103 {
    public static void main(String[] args) throws Exception {
        int x = 3;
        boolean hit = x > 5 && ++x > 0;
        if (!hit) {
            int bonus = 4;
            x += bonus;
        } else {
            x = 100;
        }
        System.out.println(x);
    }
}
