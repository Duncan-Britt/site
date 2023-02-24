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

(require 'org)
(require 'org-element)

(defun my/org-get-filetags (e)
  (let ((type (org-element-type e))
        (key (org-element-property :key e))
        (value (org-element-property :value e)))
    (if (and (eq type 'keyword) (equal key "FILETAGS"))
        (split-string value ":"))))

;; (defun org-publish-find-file-tags (file)
;;   "Return a string of comma separated file tags for the file at FILE"

;;   (let* ((visiting (find-buffer-visiting file))
;;          (buffer (or visiting (find-file-noselect file)))
;;          title)
;;     (with-current-buffer buffer
;;       (message "{")
;;       (message "%s" (org-element-map (org-element-parse-buffer) '(keyword) #'my/org-get-filetags))
;;       (message "}")
;;       (string-join (flatten-tree (org-element-map (org-element-parse-buffer) '(keyword) #'my/org-get-filetags)) ","))))

(defun org-publish-find-file-tags (file)
  "Return a string of comma separated file tags for the file at FILE"

  (let* ((visiting (find-buffer-visiting file))
         (buffer (or visiting (find-file-noselect file)))
         title)
    (with-current-buffer buffer
      (string-join
       (flatten-tree
        (let ((ret))
          (goto-char (point-min))
          (while (search-forward "#+FILETAGS:" nil t)
            (save-excursion
              (beginning-of-line)
              (setq ret (cons (my/org-get-filetags (org-element-at-point)) ret))))
          (nreverse (delq nil ret)))) ","))))

;; http://xahlee.info/emacs/emacs/elisp_parse_org_mode.html
;; http://xahlee.info/emacs/emacs/elisp_property_list.html
;; https://stackoverflow.com/questions/70359184/get-list-of-all-h1-entry-of-org-mode-buffer-or-file
;; https://github.com/tkf/org-mode/blob/master/lisp/org-publish.el
;; https://www.emacswiki.org/emacs/ElispCookbook

;; https://yannesposito.com/posts/0001-new-blog/index.html

;; for testing
;; (defun tt-parse-buff ()
;;   "2019-01-14"
;;   (interactive)
;;   (let ((tt (org-element-parse-buffer )))
;;     (with-output-to-temp-buffer "*xah temp out*"
;;       (print tt))))


(defun org-blog-sitemap-format-entry (entry _style project)
  "Return string for each ENTRY in PROJECT."
  ;; (when (s-starts-with-p "posts/" entry)
  (format (concat "@@html:<span class=\"archive-item\" data-tags=\"%s\">"
                  "<span class=\"archive-date\">@@ %s: @@html:</span>@@"
                  " [[file:%s][%s]]"
                  " @@html:</span>@@")
          (org-publish-find-file-tags (expand-file-name (concat "content/blog/" entry)))
          (format-time-string "%m-%d-%Y" (org-publish-find-date entry project))
          entry
          (org-publish-find-title entry project)))

(defun org-blog-sitemap-function (title list)
  "Return sitemap using TITLE and LIST returned by `org-blog-sitemap-format-entry'."
  (concat "#+TITLE: " title "\n"
          ;; "#+AUTHOR: " author-name "\n"
          ;; "#+EMAIL: " author-email "\n"
          "\n#+begin_archive\n"
          (mapconcat (lambda (li)
                       (format "@@html:<li>@@ %s @@html:</li>@@" (car li)))
                     (seq-filter #'car (cdr list))
                     "\n")
          "\n#+end_archive\n"))

;; Define the publishing project
(setq org-publish-project-alist
      (list
       (list "org-pages"
             :recursive nil
             :base-directory "./content"
             :base-extension "org"             
             :publishing-directory "./public"
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
             :publishing-directory "./public/blog"
             :publishing-function 'org-html-publish-to-html
             :exclude ".*\~\\|.*\.draft\.org"
             :with-author nil         ;; Don't include author name
             :with-creator nil        ;; Don't include Emacs and Org versions in footer
             :with-toc t              ;; Include table of contents
             ;; :with-tags t
             :section-numbers nil     ;; Don't include section numbers
             :time-stamp-file nil     ;; Don't include time stamp in file
             :html-preamble (read-file "./layout/preamble.html")
             :auto-sitemap t
             :sitemap-filename "blog-archive.org"
             :sitemap-title "Blog Posts"
             :sitemap-sort-files 'anti-chronologically
             :sitemap-format-entry 'org-blog-sitemap-format-entry
             :sitemap-function 'org-blog-sitemap-function
             :sitemap-style 'list)
       (list "static"
             :recursive t
             :base-directory "./content"
             :exclude ".*\~\\|.*node_modules\/.*" ;; Using CDN, excluding local node modules
             :base-extension "css\\|js\\|html\\|png\\|jpg\\|jpeg\\|svg\\|webp\\|gif\\|pdf\\|mp3\\|ogg\\|swf\\|stl\\|obj\\|wasm"
             :publishing-directory "./public"
             :publishing-function 'org-publish-attachment)
       ))


;; Generate the site output
(org-publish-all t)

(message "Build complete!")
