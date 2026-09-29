public class P0303 {
    static class Box {
        int value;
        Box(int x) {
            this.value = x;
        }
    }
    static void redirect(Box p) {
        p.value = 8;
        p = new Box(2);
        p.value = 3;
    }
    public static void main(String[] args) throws Exception {
        Box a = new Box(5);
        redirect(a);
        System.out.println(a.value);
    }
}
