OUTPUT = README.html OVERVIEW.html

all: $(OUTPUT)

%.html: %.md
	rm -f $@
	pandoc -f markdown_github-hard_line_breaks $? > $@
	chmod ugo-w $@

clean:
	rm -f $(OUTPUT)

