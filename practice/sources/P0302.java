public class P0302 {
    static class Box {
        int value;
        Box(int x) {
            this.value = x;
        }
    }
    public static void main(String[] args) throws Exception {
        Box a = new Box(4);
        Box b = new Box(7);
        Box alias = a;
        alias.value = 9;
        boolean same = a == alias;
        System.out.println(a.value + ":" + b.value + ":" + same);
    }
}
