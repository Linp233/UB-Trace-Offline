public class P1005 {
    public static void main(String[] args) throws Exception {
        int[] data = {5, 8, 2, 9};
        int target = 2;
        int count = 0;
        int found = -1;
        for (int i = 0; i < data.length; i++) {
            count++;
            if (data[i] == target) {
                found = i;
                break;
            }
        }
        System.out.println(count + ":" + found);
    }
}
