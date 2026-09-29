public class P0104 {
    public static void main(String[] args) throws Exception {
        int sum = 0;
        for (int i = 1; i <= 3; i++) {
            int temp = i * 2;
            sum += temp;
        }
        System.out.println(sum);
    }
}
