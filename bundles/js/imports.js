(function (global) {
  const root = (global.env && global.env.root) || '/'
  const importMap = {
    imports: {
      // 自定义模块包
      "unified-externals": root + "bundles/js/unified-externals.js"
    }
  };
  const script = document.createElement('script');
  script.type = "importmap";
  script.textContent = JSON.stringify(importMap);
  document.head.insertAdjacentElement('beforeend', script);
})(window);