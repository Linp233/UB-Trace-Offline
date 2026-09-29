public class P0501 {
    static class Base {
        int value;
        Base(int x) {   value = x;  }
    }
    static class Child extends Base {
        int bonus;
        Child(int x, int bonus) { super(x);    this.bonus = bonus;  }
        int total() {  return value + bonus; }
    }
    public static void main(String[] args) throws Exception {
        Child c = new Child(2, 4);
        int result = c.total();
        System.out.println(result);
    }
}
