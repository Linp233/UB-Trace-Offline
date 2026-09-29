public class P0502 {
    static class Base {
        int value;
        Base(int x) {   value = x;  }
        int score() {  return value + 1; }
    }
    static class Child extends Base {
        Child(int x) { super(x);   }
        @Override int score() {
            int parent = super.score();
            return parent * 2;
        }
    }
    public static void main(String[] args) throws Exception {
        Base b = new Child(3);
        int result = b.score();
        System.out.println(result);
    }
}
