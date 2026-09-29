public class P0602 {
    static class Base {
        int value;
        Base(int x) {   value = x;  }
        int kind() { return 1; }
    }
    static class Child extends Base {
        Child(int x) { super(x);   }
        @Override int kind() {  return value + 1; }
        int extra() {  return value * 2; }
    }
    public static void main(String[] args) throws Exception {
        Base a = new Child(4);
        int x = a.kind();
        Child b = (Child)a;
        int y = b.extra();
        System.out.println(x + ":" + y);
    }
}
