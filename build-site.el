(require 'package)
(setq package-user-dir (expand-file-name "./.pakages"))
(setq package-archives '(("melpa" . "https://melpa.org/packages/")
                         ("elpa" . "https://elpa.gnu.org/packages/")))

;; Initialize the package system
(package-initialize)
(unless package-archive-contents
  (package-refresh-contents))

;; Install dependencies
(package-install 'htmlize)

;; Load the publishing system
(require 'ox-publish)

(setq org-html-validation-link nil                    ;; Don't show validation link
      org-html-head-include-spcript nil               ;; Use our own scripts
      org-html-head-include-default-style nil)        ;; Use our own styles      
;;      org-html-head "<link rel=\"stylesheet\" href=\"https://cdn.simplecss.org/simple.min.css\" />")

(setq org-html-htmlize-output-type 'css)

(defun read-file (filename)
  (save-excursion
    (let ((new (get-buffer-create filename)) (current (current-buffer)))
      (switch-to-buffer new)
      (insert-file-contents filename)
      (mark-whole-buffer)
      (let ((contents (buffer-substring (mark) (point))))
        (kill-buffer new)
        (switch-to-buffer current)
        contents))))

;; Define the publishing project
(setq org-publish-project-alist
      (list
       (list "org-pages"
             :recursive nil
             :base-directory "./content"
             :base-extension "org"             
             :publishing-directory "./docs"
             :publishing-function 'org-html-publish-to-html
             :exclude ".*\~\\|.*\.draft\.org"
             :with-author nil         ;; Don't include author name
             :with-creator nil        ;; Don't include Emacs and Org versions in footer
             :with-toc nil            ;; Don't include table of contents
             :section-numbers nil     ;; Don't include section numbers
             :time-stamp-file nil     ;; Don't include time stamp in file
             :html-preamble (read-file "./layout/preamble.html")
             :auto-sitemap nil)
       (list "blog-content"
             :recursive t
             :base-directory "./content/blog"
             :base-extension "org\\|html"
             :publishing-directory "./docs/blog"
             :publishing-function 'org-html-publish-to-html
             :exclude ".*\~\\|.*\.draft\.org"
             :with-author nil         ;; Don't include author name
             :with-creator nil        ;; Don't include Emacs and Org versions in footer
             :with-toc t              ;; Include table of contents
             :section-numbers nil     ;; Don't include section numbers
             :time-stamp-file nil     ;; Don't include time stamp in file
             :html-preamble (read-file "./layout/preamble.html")
             :auto-sitemap t
             :sitemap-filename "blog-archive.org"
             :sitemap-title "Blog Posts"
             :sitemap-sort-files 'anti-chronologically
             :sitemap-style 'list)
       (list "static"
             :recursive t
             :base-directory "./content"
             :exclude ".*\~\\|.*node_modules\/.*" ;; Using CDN, excluding local node modules
             :base-extension "css\\|js\\|html\\|png\\|jpg\\|svg\\|webp\\|gif\\|pdf\\|mp3\\|ogg\\|swf\\|stl\\|obj\\|wasm"
             :publishing-directory "./docs"
             :publishing-function 'org-publish-attachment)
       ))


;; Generate the site output
(org-publish-all t)

(message "Build complete!")
