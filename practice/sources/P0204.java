public class P0204 {
    static void edit(int[] p) {
        p[1] = 9;
        p = new int[]{4};
    }
    public static void main(String[] args) throws Exception {
        int[] data = {1, 2};
        edit(data);
        System.out.println(data[1]);
    }
}
