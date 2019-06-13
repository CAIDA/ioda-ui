# charthouse-ui
Web application UI for the Hi3 project (https://hicube.caida.org)

### Converting old React createClass to ES6 classes

 - Install jscodeshift (`npm install -g jscodeshift`)
 - Download react-codemod (`git clone https://github.com/reactjs/react-codemod.git`)
 - Install deps (`cd react-codemod; yarn install`)
 - Run jscodeshift
 
```
jscodeshift \
  -t ~/Downloads/react-codemod/transforms/class.js \
  --extensions=js,jsx \
  assets/js/Explorer/viz-plugins/stacked-horizon.jsx
```
