#include <emscripten.h>

int main() {
    return 0;
}

EMSCRIPTEN_KEEPALIVE
float add(float x, float y) {
    return x + y;
}
