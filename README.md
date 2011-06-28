#An HTML Validator in Javascript (Insert catchy name here)

Are you fed up of using slow, server side validators with obscure error messages?
Maybe you aren't, but as a Chrome developer I am, because there is no decent HTML validation solution.
The aim of this project is this:

- To allow anyone on any browser be able to validate HTML, either using a bookmarklet or browser extension
- To support the major doctypes: HTML 4.01, XHTML 1.0 and eventually HTML 5
- To provide a plain English, sensible version of the W3C HTML spec

I'd also like to use the platform to create an experimental doctype for best practice HTML, which would evolve with the web.

#TODO

- Add doctype detection
- Check attribute values are valid
- Check code ignores comments/text where appropriate
- Differentiate between cdata and whitespace
- Check XHTML closing tags / not self closing
- Ask John Resig about weird regex
- Investigate escaped attribute value regex
- Log CDATA/comment sections in cdata
- Fix problem with frameset as frameset child
- Add a lateral stack to find mistakenly closed unary elements
- Rename tag to element where appropriate

#The Parser

Here I'll explain how the parser works, some of the intricacies of HTML, and how they are handled by the parser.

#Doctypes

Here I'll explain the format of the doctypes.

#HTML Doctype Bugs

- object in head can contain content
- object in head can contain head elements
- Textarea can contain del/ins
- Noscript can contain script
- li types are only specified in comment (transitional)
- id does not allow multiple ids (give example)
- class attribute does not have any kind of constraint
- html special chars do not require escaping, except quotes in attributes

#HTML W3C Validator Bugs

- Fails when implicit tags have no children (e.g. table has no tbody or tbody children)