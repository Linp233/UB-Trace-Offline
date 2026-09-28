public class Practice2 {
    static int[] createPair() {
        int[] result = {2, 8};
        return result;
    }

    public static void main(String[] args) {
        int[] numbers = createPair();
        int[] alias = numbers;
        alias[1] = 9;
        System.out.println(numbers[1]);
    }
}
