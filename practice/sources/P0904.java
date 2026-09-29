public class P0904 {
    public static void main(String[] args) throws Exception {
        int[] previous = {-1, 0, 0, 1};
        int current = 3;
        java.util.ArrayList<Integer> reverse = new java.util.ArrayList<>();
        while (current != -1) {
            reverse.add(current);
            current = previous[current];
        }
        System.out.println(reverse);
    }
}
